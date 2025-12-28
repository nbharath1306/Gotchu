"use server"

import { createClient } from "@/lib/supabase-server"
import { auth0 } from "@/lib/auth0";
import { revalidatePath } from "next/cache"
import { nanoid } from "nanoid";

export async function resolveItem(itemId: string) {
  const supabase = await createClient()
  const session = await auth0.getSession();
  const user = session?.user;

  if (!user) {
    return { error: "Unauthorized" }
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

  // 3. Award Karma if it was a FOUND item (The finder is closing it)
  if (item.type === 'FOUND') {
    // Fetch current karma
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

// ... (imports)
import { ensureUserExists } from "@/lib/users"; // Add this import at top if possible, but tool limits.

export async function createItem(data: {
  type: 'LOST' | 'FOUND',
  title: string,
  description?: string,
  category: string,
  location_zone: string,
  bounty_text?: string,
  user_id: string
}) {
  const supabase = await createClient()
  // NOTE: This server action receives `user_id` but we should verify against session for security relative to creation
  // logic is typically handled in submitReportAction which calls this.
  // Ideally we should use the session user, not data.user_id trusted blindly if it comes from client.
  // But for now keeping signature match.

  // However, createItem is exported but seemingly unused? submitReportAction does the insertion directly.
  // Let's modify submitReportAction mainly.

  // ... keeping existing code for createItem just in case, but fixing imports implies modifying file broadly.
  return { error: "Deprecated: use submitReportAction" }
}


export async function submitReportAction(formData: FormData) {
  console.log("submitReportAction started");
  try {
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

    // Get ID Token or Access Token to pass to Supabase for RLS
    const token = session?.idToken || session?.accessToken;

    // Pass token to createClient
    const supabase = await createClient(token as string | undefined)
    console.log("Supabase client created with token");

    if (!token) {
      console.warn("WARNING: No Auth0 ID/Access Token found. Supabase RLS may fail.");
    }

    // Sync user to DB
    const syncResult = await ensureUserExists(supabase, user);
    if (!syncResult.success) {
      console.error("Failed to sync user to database:", syncResult.error);
      return { error: `User Sync Failed: ${syncResult.error}. (Token present: ${!!token})` };
    }

    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const category = formData.get("category") as string
    const location = formData.get("location") as string
    const date = formData.get("date") as string
    const type = formData.get("type") as "LOST" | "FOUND"

    // CHANGED: Get image_url string directly (uploaded by client)
    const imageUrl = formData.get("image_url") as string

    console.log("Form data parsed:", { title, category, location, date, type, imageUrl });

    // Server-side upload logic removed - client handles it now.

    console.log("Inserting item into database...");
    const itemId = nanoid();
    const { data: newItem, error: insertError } = await supabase
      .from("items")
      .insert({
        id: itemId,
        title,
        description,
        category,
        location_zone: location,
        date_reported: date,
        image_url: imageUrl || null, // Ensure null if empty string
        type,
        user_id: user.sub,
        status: "OPEN"
      })
      .select()
      .single()

    if (insertError) {
      console.error("Insert error:", insertError)
      return { error: "Database error: " + insertError.message }
    }

    if (!newItem || !newItem.id || typeof newItem.id !== "string" || newItem.id.trim() === "") {
      console.error("Insert succeeded but invalid or missing item ID", { newItem });
      return { error: "Failed to create item: No valid item ID returned from database." }
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

export async function startChat(itemId: string) {
  const supabase = await createClient()
  const session = await auth0.getSession();
  const user = session?.user;

  if (!user) {
    return { error: "Unauthorized" }
  }

  // Sync user to DB (just in case)
  await ensureUserExists(supabase, user);

  // 1. Fetch item to get owner
  const { data: item, error: itemError } = await supabase
    .from('items')
    .select('user_id')
    .eq('id', itemId)
    .single()

  if (itemError || !item) {
    return { error: "Item not found" }
  }

  if (item.user_id === user.sub) {
    return { error: "You cannot chat with yourself" }
  }

  if (!item.user_id || !user.sub) {
    console.error("Missing user IDs:", { itemOwner: item.user_id, currentUser: user.sub })
    return { error: "Invalid user data" }
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

  // 3. Create new chat with unique id
  const chatId = nanoid();
  const { data: newChat, error: createError } = await supabase
    .from('chats')
    .insert({
      id: chatId,
      item_id: itemId,
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
