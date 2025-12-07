import { createClient } from "@/lib/supabase-server"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { auth0 } from "@/lib/auth0";

export const dynamic = 'force-dynamic'

export default async function ChatListPage() {
  const supabase = await createClient()
  const session = await auth0.getSession();
  const user = session?.user;

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
    .or(`user_a.eq.${user.sub},user_b.eq.${user.sub}`)
    .order('created_at', { ascending: false })

  if (error) {
    console.error(error)
    return <div className="p-8 text-center">Error loading chats.</div>
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl min-h-[calc(100vh-4rem)]">
      <h1 className="text-3xl font-bold mb-8 text-gradient">Your Messages</h1>
      <div className="space-y-4">
        {chats?.map((chat: any) => {
          // Determine the "other" user
          const otherUser = chat.user_a_data.id === user.sub ? chat.user_b_data : chat.user_a_data
          
          return (
            <Link href={`/chat/${chat.id}`} key={chat.id}>
              <Card className="glass border-white/10 hover:bg-white/10 dark:hover:bg-white/5 transition-all duration-200 cursor-pointer group">
                <CardHeader className="flex flex-row items-center gap-4 p-4">
                  <Avatar className="h-12 w-12 border-2 border-violet-500/20">
                    <AvatarImage src={otherUser.avatar_url} />
                    <AvatarFallback className="bg-violet-500/10 text-violet-500">{otherUser.full_name?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-base group-hover:text-violet-500 transition-colors">{otherUser.full_name || 'Anonymous User'}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Regarding: <span className="font-medium text-foreground">{chat.item.title}</span> 
                      <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${chat.item.type === 'LOST' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                        {chat.item.type}
                      </span>
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
          <div className="text-center text-muted-foreground py-12 glass rounded-xl border-dashed border-2 border-white/10">
            No active chats. Start a conversation from the feed!
          </div>
        )}
      </div>
    </div>
  )
}
