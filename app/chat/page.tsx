import { createClient } from "@/lib/supabase-server"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"

export const dynamic = 'force-dynamic'

export default async function ChatListPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <div className="p-8 text-center">Please login to view your chats.</div>
  }

  // Fetch chats where current user is either user_a or user_b
  const { data: chats, error } = await supabase
    .from('chats')
    .select(`
      id,
      created_at,
      item:items (
        title,
        type
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
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
    .order('created_at', { ascending: false })

  if (error) {
    console.error(error)
    return <div className="p-8 text-center">Error loading chats.</div>
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Your Messages</h1>
      <div className="space-y-4">
        {chats?.map((chat: any) => {
          // Determine the "other" user
          const otherUser = chat.user_a_data.id === user.id ? chat.user_b_data : chat.user_a_data
          
          return (
            <Link href={`/chat/${chat.id}`} key={chat.id}>
              <Card className="hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer">
                <CardHeader className="flex flex-row items-center gap-4 p-4">
                  <Avatar>
                    <AvatarImage src={otherUser.avatar_url} />
                    <AvatarFallback>{otherUser.full_name?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-base">{otherUser.full_name || 'Anonymous User'}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Regarding: <span className="font-medium text-foreground">{chat.item.title}</span> ({chat.item.type})
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(chat.created_at), { addSuffix: true })}
                  </div>
                </CardHeader>
              </Card>
            </Link>
          )
        })}
        {chats?.length === 0 && (
          <div className="text-center text-muted-foreground py-12">
            No active chats.
          </div>
        )}
      </div>
    </div>
  )
}
