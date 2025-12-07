"use server"

import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

export async function resolveItem(itemId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

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

  if (item.user_id !== user.id) {
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
      .eq('id', user.id)
      .single()
    
    if (!userError && userData) {
      const newKarma = (userData.karma_points || 0) + 50
      
      await supabase
        .from('users')
        .update({ karma_points: newKarma })
        .eq('id', user.id)
    }
  }

  revalidatePath('/feed')
  return { success: true }
}
