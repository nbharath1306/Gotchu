import { createClient } from "@/lib/supabase-server"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { auth0 } from "@/lib/auth0";
import { MessageSquare, ArrowRight, Search } from "lucide-react";

export const dynamic = 'force-dynamic'

export default async function ChatListPage() {
  // Use Admin Client to bypass RLS token issues
  const { createAdminClient } = await import("@/lib/supabase-server");
  const supabase = await createAdminClient();

  if (!supabase) {
    return <div>System Error: Database connection failed.</div>;
  }

  // Fetch chats where current user is either user_a or user_b
  // Admin client bypasses RLS, so this WHERE clause is critical for security.
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
    .or(`user_a.eq."${user.sub}",user_b.eq."${user.sub}"`) // Ensure quotes for text IDs
    .order('created_at', { ascending: false })

  if (error) {
    console.error(error)
    return (
      <div className="min-h-screen bg-[#F2F2F2] pt-24 px-4">
        <div className="max-w-2xl mx-auto text-center p-8 border border-red-200 bg-red-50 text-red-600 font-mono text-sm">
          SYSTEM ERROR: UNABLE TO LOAD CHANNELS ({error.message})
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F2F2F2] pt-24 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 flex items-end justify-between border-b border-[#E5E5E5] pb-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-[#111111]">
              MESSAGES
            </h1>
            <p className="text-[#666666] mt-1 font-mono text-xs uppercase tracking-wider">
              SECURE CHANNELS: {chats?.length || 0} ACTIVE
            </p>
          </div>
        </div>

        {(!chats || chats.length === 0) ? (
          <div className="text-center py-20 border border-dashed border-[#E5E5E5]">
            <div className="w-16 h-16 bg-[#FFFFFF] rounded-full flex items-center justify-center mx-auto mb-6 border border-[#E5E5E5]">
              <MessageSquare className="h-6 w-6 text-[#666666]" />
            </div>
            <h3 className="text-lg font-bold text-[#111111] mb-2 font-display">NO ACTIVE CHANNELS</h3>
            <p className="text-[#666666] font-mono text-sm">INITIATE COMMUNICATION VIA FEED</p>
            <Link href="/feed" className="mt-6 inline-block btn-primary px-6 py-3 text-xs">
              BROWSE DATABASE
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {chats.map((chat: any) => {
              const userA = Array.isArray(chat.user_a_data) ? chat.user_a_data[0] : chat.user_a_data
              const userB = Array.isArray(chat.user_b_data) ? chat.user_b_data[0] : chat.user_b_data
              const item = Array.isArray(chat.item) ? chat.item[0] : chat.item

              const otherUser = userA.id === user.sub ? userB : userA

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
                          className="w-12 h-12 rounded-full border border-[#E5E5E5]"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-[#FFFFFF] flex items-center justify-center text-[#111111] font-bold border border-[#E5E5E5]">
                          {otherUser.full_name?.[0] || 'U'}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-sm truncate pr-2">{otherUser.full_name}</h3>
                        <span className="text-[10px] font-mono text-[#666666] whitespace-nowrap">
                          {formatDistanceToNow(new Date(chat.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 border ${item.type === 'LOST'
                            ? 'bg-red-50 text-red-600 border-red-100'
                            : 'bg-blue-50 text-blue-600 border-blue-100'
                          }`}>
                          {item.type}
                        </span>
                        <p className="text-xs text-[#666666] truncate font-mono">
                          REF: {item.title}
                        </p>
                      </div>
                    </div>

                    <ArrowRight className="w-4 h-4 text-[#666666] group-hover:text-black transition-colors" />
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
