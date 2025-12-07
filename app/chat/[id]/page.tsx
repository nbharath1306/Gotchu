import { createClient } from "@/lib/supabase-server"
import ChatInterface from "@/components/chat-interface"
import { redirect } from "next/navigation"

interface ChatPageProps {
  params: {
    id: string
  }
}

export default async function ChatPage({ params }: ChatPageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/")
  }

  // Fetch chat details to verify access and get other user info
  const { data: chat, error } = await supabase
    .from('chats')
    .select(`
      id,
      user_a,
      user_b,
      item:items (
        title
      ),
      user_a_data:users!chats_user_a_fkey (
        id,
        full_name,
        avatar_url
      ),
      user_b_data:users!chats_user_b_fkey (
        id,
        full_name,
        avatar_url
      )
    `)
    .eq('id', params.id)
    .single()

  if (error || !chat) {
    return <div>Chat not found or access denied.</div>
  }

  // Verify user is part of this chat
  if (chat.user_a !== user.id && chat.user_b !== user.id) {
    return <div>Access denied.</div>
  }

  const otherUser = chat.user_a === user.id ? chat.user_b_data : chat.user_a_data
  
  // Handle potential array return from Supabase join and type mismatch
  const otherUserFixed = Array.isArray(otherUser) ? otherUser[0] : otherUser
  const itemData = Array.isArray(chat.item) ? chat.item[0] : chat.item

  return (
    <ChatInterface 
      chatId={chat.id} 
      currentUserId={user.id} 
      otherUser={otherUserFixed as any}
      itemTitle={(itemData as any).title}
    />
  )
}
