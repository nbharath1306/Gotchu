"use server"

import { createClient } from "@/lib/supabase-server"
import { auth0 } from "@/lib/auth0";
import { revalidatePath } from "next/cache"

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
  const session = await auth0.getSession();
  const user = session?.user;

  if (!user) {
    return { error: "Unauthorized" }
  }

  const { data: newItem, error } = await supabase.from("items").insert({
    type: data.type,
    title: data.title,
    description: data.description,
    category: data.category,
    location_zone: data.location_zone,
    bounty_text: data.bounty_text,
    user_id: user.sub,
    status: "OPEN"
  })
  .select()
  .single()

  if (error) {
    console.error("Supabase insert error:", error)
    return { error: `Failed to submit report: ${error.message}` }
  }

  return { success: true, itemId: newItem.id }
}

export async function submitReportAction(formData: FormData) {
  console.log("submitReportAction started");
  try {
    const supabase = await createClient()
    console.log("Supabase client created");

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

    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const category = formData.get("category") as string
    const location = formData.get("location") as string
    const date = formData.get("date") as string
    const type = formData.get("type") as "LOST" | "FOUND"
    const imageFile = formData.get("image") as File

    console.log("Form data parsed:", { title, category, location, date, type });

    let imageUrl = null
    if (imageFile && imageFile.size > 0) {
      console.log("Processing image upload...");
      try {
        const fileExt = imageFile.name.split(".").pop()
        const fileName = `${Math.random()}.${fileExt}`
        
        const arrayBuffer = await imageFile.arrayBuffer()
        const buffer = new Uint8Array(arrayBuffer)

        const { error: uploadError } = await supabase.storage
          .from("items")
          .upload(fileName, buffer, {
            contentType: imageFile.type,
            upsert: false
          })

        if (uploadError) {
          console.error("Upload error:", uploadError)
          return { error: "Failed to upload image: " + uploadError.message }
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from("items")
          .getPublicUrl(fileName)
          
        imageUrl = publicUrl
        console.log("Image uploaded successfully:", imageUrl);
      } catch (uploadEx) {
        console.error("Exception during image upload:", uploadEx);
        return { error: "Image upload crashed" };
      }
    }

    console.log("Inserting item into database...");
    const { data: newItem, error: insertError } = await supabase
      .from("items")
      .insert({
        title,
        description,
        category,
        location_zone: location,
        date_reported: date,
        image_url: imageUrl,
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

    if (!newItem) {
      console.error("Insert succeeded but no item returned");
      return { error: "Failed to retrieve created item" }
    }

    console.log("Item created successfully:", newItem.id);

    try {
      revalidatePath('/feed')
    } catch (revalidateError) {
      console.error("revalidatePath error:", revalidateError);
      // Ignore revalidation error, it's not critical for the user response
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

  // 3. Create new chat
  const { data: newChat, error: createError } = await supabase
    .from('chats')
    .insert({
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
