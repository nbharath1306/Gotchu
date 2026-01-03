"use server"

import { createClient, createAdminClient } from "@/lib/supabase-server"
import { auth0 } from "@/lib/auth0";
import { revalidatePath } from "next/cache"
import { nanoid } from "nanoid";
import { ensureUserExists } from "@/lib/users";

export async function resolveItem(itemId: string) {
  // Strategy: Try Admin first, then fallback to user token
  let supabase = null;
  const adminClient = await createAdminClient();

  if (adminClient) {
    supabase = adminClient;
  } else {
    supabase = await createClient();
  }

  const session = await auth0.getSession();
  const user = session?.user;

  if (!user) {
    return { error: "Unauthorized" }
  }

  if (!supabase && !adminClient) {
    // Revert to token logic if admin fails to init
    let token = session?.idToken || session?.accessToken;
    supabase = await createClient(token as string | undefined);
  }

  // 1. Fetch the item to verify ownership and type
  const { data: item, error: fetchError } = await supabase
    .from('items')
    .select('*')
    .eq('id', itemId)
    .single()

  if (fetchError || !item) {
    return { error: "Item not found" }
  }

  if (item.user_id !== user.sub) {
    return { error: "You can only resolve your own items" }
  }

  if (item.status === 'RESOLVED') {
    return { error: "Item already resolved" }
  }

  // 2. Update item status
  const { error: updateError } = await supabase
    .from('items')
    .update({ status: 'RESOLVED' })
    .eq('id', itemId)

  if (updateError) {
    return { error: "Failed to update item status" }
  }

  // 3. Award Karma if it was a FOUND item
  if (item.type === 'FOUND') {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('karma_points')
      .eq('id', user.sub)
      .single()

    if (!userError && userData) {
      const newKarma = (userData.karma_points || 0) + 50

      await supabase
        .from('users')
        .update({ karma_points: newKarma })
        .eq('id', user.sub)
    }
  }

  revalidatePath('/feed')
  return { success: true }
}


export async function createItem(data: {
  type: 'LOST' | 'FOUND',
  title: string,
  description?: string,
  category: string,
  location_zone: string,
  bounty_text?: string,
  user_id: string
}) {
  return { error: "Deprecated: use submitReportAction" }
}


import { ReportSchema } from "@/lib/schemas";

export async function submitReportAction(formData: FormData) {
  console.log("submitReportAction started");
  try {
    // 1. Authentication
    let session;
    try {
      session = await auth0.getSession();
    } catch (authError) {
      console.error("Auth0 getSession error:", authError);
      return { error: "Authentication failed" };
    }

    const user = session?.user;

    if (!user) {
      console.log("No user found in session");
      return { error: "Unauthorized" }
    }
    console.log("User authenticated:", user.sub);

    // 2. Data Validation with Zod
    const rawData = {
      title: formData.get("title"),
      description: formData.get("description"),
      category: formData.get("category"),
      location: formData.get("location"),
      date: formData.get("date"),
      type: formData.get("type"),
      image_url: formData.get("image_url"),
    };

    const validationResult = ReportSchema.safeParse(rawData);

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0].message;
      return { error: firstError };
    }

    const val = validationResult.data;

    // 3. Database Connection
    let supabase;
    let usingAdmin = false;

    // STRATEGY: Prefer Admin Client (Service Role) for guaranteed writes
    const adminClient = await createAdminClient();
    if (adminClient) {
      supabase = adminClient;
      usingAdmin = true;
      console.log("Using Admin Client for reliable writes.");
    } else {
      console.warn("No Admin Client (SUPABASE_SERVICE_ROLE_KEY missing?). Falling back to User Token.");
      // Fallback: Try to get token for RLS
      let token = session?.idToken;
      if (!token) {
        try {
          const tokenResponse = await auth0.getAccessToken();
          token = tokenResponse?.token;
        } catch (e) { }
      }
      if (!token) token = session?.accessToken;

      supabase = await createClient(token as string | undefined);
    }

    // 4. Sync User
    const syncResult = await ensureUserExists(supabase, user);
    if (!syncResult.success) {
      console.error("Failed to sync user to database:", syncResult.error);
      return { error: `User Sync Failed: ${syncResult.error}. (Admin: ${usingAdmin})` };
    }

    console.log("Inserting item into database...");
    const itemId = nanoid();
    const { data: newItem, error: insertError } = await supabase
      .from("items")
      .insert({
        id: itemId,
        title: val.title,
        description: val.description,
        category: val.category,
        location_zone: val.location,
        date_reported: val.date,
        image_url: val.image_url || null,
        type: val.type,
        user_id: user.sub, // Trusted user ID from session
        status: "OPEN"
      })
      .select()
      .single()

    if (insertError) {
      console.error("Insert error:", insertError)
      return { error: "Database error: " + insertError.message }
    }

    if (!newItem || !newItem.id) {
      return { error: "Failed to create item: No ID returned." }
    }

    console.log("Item created successfully:", newItem.id);

    try {
      revalidatePath('/feed')
    } catch (revalidateError) {
      console.error("revalidatePath error:", revalidateError);
    }

    return { success: true, itemId: newItem.id }
  } catch (e: any) {
    console.error("CRITICAL ERROR in submitReportAction:", e)
    return { error: "Server error: " + (e.message || "Unknown error") }
  }
}

export async function startChat(itemId: string, relatedItemId?: string) {
  const session = await auth0.getSession();
  const user = session?.user;

  if (!user) {
    return { error: "Unauthorized" }
  }

  // STRATEGY: Prefer Admin Client
  let supabase;
  const adminClient = await createAdminClient();
  if (adminClient) {
    supabase = adminClient;
  } else {
    let token = session?.idToken || session?.accessToken;
    supabase = await createClient(token as string | undefined);
  }

  // Sync user to DB (just in case)
  await ensureUserExists(supabase, user);

  // 1. Fetch item to get owner
  const { data: item, error: itemError } = await supabase
    .from('items')
    .select('user_id, type')
    .eq('id', itemId)
    .single()

  if (itemError || !item) {
    return { error: "Item not found" }
  }

  if (item.user_id === user.sub) {
    return { error: `You cannot chat with yourself. (ItemOwner: ${item.user_id}, You: ${user.sub})` }
  }

  // 1.5 Verify Related Item (if provided)
  if (relatedItemId) {
    const { data: relatedItem } = await supabase
      .from('items')
      .select('user_id, type')
      .eq('id', relatedItemId)
      .single();

    if (!relatedItem) {
      return { error: "Related item not found" };
    }

    if (relatedItem.user_id !== user.sub) {
      return { error: "You can only link items you reported." };
    }

    if (relatedItem.type === item.type) {
      return { error: `Cannot link two ${item.type} items. Must link LOST with FOUND.` };
    }
  }

  // 2. Check if chat already exists
  const { data: existingChat, error: chatError } = await supabase
    .from('chats')
    .select('id')
    .eq('item_id', itemId)
    .or(`and(user_a.eq."${user.sub}",user_b.eq."${item.user_id}"),and(user_a.eq."${item.user_id}",user_b.eq."${user.sub}")`)
    .single()

  if (existingChat) {
    return { chatId: existingChat.id }
  }

  // 3. Create new chat with unique id AND related item
  const chatId = nanoid();
  const { data: newChat, error: createError } = await supabase
    .from('chats')
    .insert({
      id: chatId,
      item_id: itemId,
      related_item_id: relatedItemId || null, // Link the other item!
      user_a: user.sub,
      user_b: item.user_id
    })
    .select()
    .single()

  if (createError) {
    console.error("Create chat error:", createError)
    return { error: "Failed to create chat" }
  }

  return { chatId: newChat.id }
}

export async function resolveMatch(chatId: string) {
  return { error: "Deprecated: Use POST /api/chat/close instead." }
}

export async function deleteItem(itemId: string) {
  const session = await auth0.getSession();
  const user = session?.user;

  if (!user) {
    return { error: "Unauthorized" }
  }

  // Use Admin Client to ensure we can force delete (bypassing restrictive RLS if needed, though usually owner can delete)
  // But strictly, we check ownership first.
  let supabase;
  const adminClient = await createAdminClient();
  if (adminClient) {
    supabase = adminClient;
  } else {
    // Fallback
    let token = session?.idToken || session?.accessToken;
    supabase = await createClient(token as string | undefined);
  }

  // 2. Verify Ownership OR Admin Status
  const { data: item, error: fetchError } = await supabase
    .from('items')
    .select('user_id')
    .eq('id', itemId)
    .single()

  if (fetchError || !item) {
    return { error: "Item not found" }
  }

  // Check Admin Role from DB
  const { data: dbUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.sub)
    .single();

  const isAdmin = dbUser?.role === 'ADMIN' || (!!user.email && ["n.bharath3430@gmail.com", "amazingakhil2006@gmail.com"].includes(user.email));

  if (item.user_id !== user.sub && !isAdmin) {
    return { error: "You can only delete your own items" }
  }

  // 3. Delete
  const { error: deleteError } = await supabase
    .from('items')
    .delete()
    .eq('id', itemId)

  if (deleteError) {
    console.error("Delete item error:", deleteError)
    return { error: `Delete failed: ${deleteError.message} (${deleteError.code})` }
  }

  revalidatePath('/feed')
  revalidatePath('/profile')
  revalidatePath('/admin') // Revalidate admin dashboard too

  return { success: true }
}
import { NeuralParser } from "@/lib/neural/parser";

export async function submitNeuralReport(query: string, imageUrl?: string, reportType: "LOST" | "FOUND" = "LOST") {
  try {
    const session = await auth0.getSession();
    const user = session?.user;

    if (!user) return { error: "Unauthorized" };

    // 1. Parse the input
    const signal = NeuralParser.parse(query);

    // 2. Map to Enum values (Simple heuristics for now)
    const categoryMap: any = {
      "electronics": "Electronics",
      "keys": "Keys",
      "id / wallet": "ID",
      "clothing": "Other", // Schema doesn't have Clothing? Let's check schema. Schema has: Electronics, ID, Keys, Other.
      "documents": "Other"
    };

    // Schema demands: "Innovation_Labs", "Canteen", "Bus_Bay", "Library", "Hostels", "Other"
    const locationMap: any = {
      "innovation_labs": "Innovation_Labs",
      "canteen": "Canteen",
      "bus_bay": "Bus_Bay",
      "library": "Library",
      "hostels": "Hostels",
      "sports_complex": "Other"
    };

    const finalCategory = categoryMap[signal.category?.toLowerCase() || ""] || "Other";
    const finalLocation = locationMap[signal.location?.toLowerCase() || ""] || "Other";

    // 3. Create Item directly (Bypassing strict form schema for now to allow "Magic")
    const adminClient = await createAdminClient();
    const supabase = adminClient || await createClient(); // Fallback

    await ensureUserExists(supabase, user);

    // 2.5: Server-side Deduplication (Idempotency)
    // Check if the same user submitted the same description in the last 60 seconds
    const { data: recentItem } = await supabase
      .from('items')
      .select('id, created_at')
      .eq('user_id', user.sub)
      .eq('description', query)
      .eq('type', reportType)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (recentItem && recentItem.created_at) {
      const timeSince = Date.now() - new Date(recentItem.created_at).getTime();
      if (timeSince < 60000) { // 60 seconds window
        console.log("Duplicate submission detected. Returning existing item.", recentItem.id);
        revalidatePath('/feed');
        return { success: true, itemId: recentItem.id };
      }
    }

    const itemId = nanoid();
    const { data: newItem, error } = await supabase
      .from("items")
      .insert({
        id: itemId,
        title: signal.category || "Unknown Item", // e.g. "Red Wallet" if we had title extraction
        description: query, // The full raw text is the description
        category: finalCategory,
        location_zone: finalLocation,
        date_reported: new Date().toISOString().split('T')[0],
        image_url: imageUrl || null,
        type: reportType,
        user_id: user.sub,
        status: "OPEN"
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    revalidatePath('/feed');
    return { success: true, itemId };

  } catch (e: any) {
    console.error("Neural Submit Error:", e);
    return { error: e.message };
  }
}
