import { auth0 } from "@/lib/auth0"
import { createClient } from "@/lib/supabase-server"
import ChatInterface from "@/components/chat-interface"
import { redirect } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface ChatPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { id } = await params;
  const session = await auth0.getSession()
  const user = session?.user

  if (!user) {
    redirect("/login")
  }

  // Use Admin Client to bypass RLS token issues
  const { createAdminClient } = await import("@/lib/supabase-server");
  const supabase = await createAdminClient();

  if (!supabase) {
    console.error("Critical: Admin client failed to initialize.");
    // Fallback or error
    return <div>System Error: Database connection failed.</div>;
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
    .eq('id', id)
    .single()

  if (error || !chat) {
    return (
      <div className="min-h-screen bg-[#F2F2F2] pt-24 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#111111] mb-4">Chat not found</h2>
          <p className="text-xs text-gray-400 mb-4">{error?.message}</p>
          <Link href="/chat" className="text-[#FF4F4F] hover:underline">
            Return to messages
          </Link>
        </div>
      </div>
    )
  }

  // Verify user is part of the chat
  if (chat.user_a !== user.sub && chat.user_b !== user.sub) {
    redirect("/chat")
  }

  const otherUser = chat.user_a === user.sub ? chat.user_b_data : chat.user_a_data
  // Handle case where otherUser might be an array (though single() should prevent this, types might be weird)
  const otherUserData = Array.isArray(otherUser) ? otherUser[0] : otherUser

  const itemData = Array.isArray(chat.item) ? chat.item[0] : chat.item

  return (
    <div className="min-h-screen bg-[#F2F2F2] flex flex-col">
      <header className="bg-white border-b-2 border-[#111111] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/chat"
              className="p-2 -ml-2 hover:bg-[#F2F2F2] rounded-none transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-[#111111]" />
            </Link>
            <div>
              <h1 className="font-bold text-[#111111] uppercase tracking-tight">
                {otherUserData?.full_name || 'Unknown User'}
              </h1>
              <p className="text-xs text-[#666666] font-mono">
                {itemData?.title || 'Item Chat'}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full p-4">
        <div className="bg-white border-2 border-[#111111] shadow-[4px_4px_0px_0px_#111111] h-[calc(100vh-8rem)] overflow-hidden">
          <ChatInterface
            chatId={chat.id}
            currentUserId={user.sub}
            otherUser={{
              full_name: otherUserData?.full_name || 'Unknown User',
              avatar_url: otherUserData?.avatar_url || ''
            }}
            itemTitle={itemData?.title || 'Item'}
          />
        </div>
      </main>
    </div>
  )
}
