import { createClient } from "@/lib/supabase-server"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { auth0 } from "@/lib/auth0";
import { MessageSquare, ArrowRight, Search } from "lucide-react";

export const dynamic = 'force-dynamic'

export default async function ChatListPage() {
  const supabase = await createClient()
  const session = await auth0.getSession();
  const user = session?.user;

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--bg-paper)] flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="font-display font-bold text-xl mb-2">AUTHENTICATION REQUIRED</h2>
          <Link href="/auth/login" className="btn-primary inline-block px-6 py-2">
            LOGIN
          </Link>
        </div>
      </div>
    )
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
    return (
      <div className="min-h-screen bg-[var(--bg-paper)] pt-24 px-4">
        <div className="max-w-2xl mx-auto text-center p-8 border border-red-200 bg-red-50 text-red-600 font-mono text-sm">
          SYSTEM ERROR: UNABLE TO LOAD CHANNELS
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-paper)] pt-24 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 flex items-end justify-between border-b border-[var(--border-default)] pb-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-[var(--text-primary)]">
              MESSAGES
            </h1>
            <p className="text-[var(--text-secondary)] mt-1 font-mono text-xs uppercase tracking-wider">
              SECURE CHANNELS: {chats?.length || 0} ACTIVE
            </p>
          </div>
        </div>

        {(!chats || chats.length === 0) ? (
          <div className="text-center py-20 border border-dashed border-[var(--border-default)]">
            <div className="w-16 h-16 bg-[var(--bg-surface)] rounded-full flex items-center justify-center mx-auto mb-6 border border-[var(--border-default)]">
              <MessageSquare className="h-6 w-6 text-[var(--text-secondary)]" />
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2 font-display">NO ACTIVE CHANNELS</h3>
            <p className="text-[var(--text-secondary)] font-mono text-sm">INITIATE COMMUNICATION VIA FEED</p>
            <Link href="/feed" className="mt-6 inline-block btn-primary px-6 py-3 text-xs">
              BROWSE DATABASE
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {chats.map((chat: any) => {
              const otherUser = chat.user_a_data.id === user.sub ? chat.user_b_data : chat.user_a_data
              
              return (
                <Link 
                  key={chat.id} 
                  href={`/chat/${chat.id}`}
                  className="block group"
                >
                  <div className="card-swiss p-6 bg-white hover:border-black transition-colors flex items-center gap-4">
                    <div className="relative">
                      {otherUser.avatar_url ? (
                        <img 
                          src={otherUser.avatar_url} 
                          alt={otherUser.full_name}
                          className="w-12 h-12 rounded-full border border-[var(--border-default)]"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-[var(--bg-surface)] flex items-center justify-center text-[var(--text-primary)] font-bold border border-[var(--border-default)]">
                          {otherUser.full_name?.[0] || 'U'}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-sm truncate pr-2">{otherUser.full_name}</h3>
                        <span className="text-[10px] font-mono text-[var(--text-secondary)] whitespace-nowrap">
                          {formatDistanceToNow(new Date(chat.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 border ${
                          chat.item.type === 'LOST' 
                            ? 'bg-red-50 text-red-600 border-red-100' 
                            : 'bg-blue-50 text-blue-600 border-blue-100'
                        }`}>
                          {chat.item.type}
                        </span>
                        <p className="text-xs text-[var(--text-secondary)] truncate font-mono">
                          REF: {chat.item.title}
                        </p>
                      </div>
                    </div>

                    <ArrowRight className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-black transition-colors" />
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
