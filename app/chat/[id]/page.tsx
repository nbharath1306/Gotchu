import { createClient } from "@/lib/supabase-server"
import ChatInterface from "@/components/chat-interface"
import { redirect } from "next/navigation"
import { auth0 } from "@/lib/auth0";

interface ChatPageProps {
  params: {
    id: string
  }
}

export default async function ChatPage({ params }: ChatPageProps) {
  const supabase = await createClient()
  const session = await auth0.getSession();
  const user = session?.user;

  if (!user) {
    redirect("/auth/login")
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
  if (chat.user_a !== user.sub && chat.user_b !== user.sub) {
    return <div>Access denied.</div>
  }

  const otherUser = chat.user_a === user.sub ? chat.user_b_data : chat.user_a_data
  
  // Handle potential array return from Supabase join and type mismatch
  const otherUserFixed = Array.isArray(otherUser) ? otherUser[0] : otherUser
  const itemData = Array.isArray(chat.item) ? chat.item[0] : chat.item

  return (
    <ChatInterface 
      chatId={chat.id} 
      currentUserId={user.sub} 
      otherUser={otherUserFixed as any}
      itemTitle={(itemData as any).title}
    />
  )
}
