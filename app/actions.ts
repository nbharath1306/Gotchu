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
  category: string,
  location_zone: string,
  bounty_text?: string
}) {
  const supabase = await createClient()
  const session = await auth0.getSession();
  const user = session?.user;

  if (!user) {
    return { error: "Unauthorized" }
  }

  const { error } = await supabase.from("items").insert({
    type: data.type,
    title: data.title,
    category: data.category,
    location_zone: data.location_zone,
    bounty_text: data.bounty_text,
    user_id: user.sub,
    status: "OPEN"
  })

  if (error) {
    console.error("Supabase insert error:", error)
    return { error: `Failed to submit report: ${error.message}` }
  }

  revalidatePath('/feed')
  return { success: true }
}
