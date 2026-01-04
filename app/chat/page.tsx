export const dynamic = 'force-dynamic'

import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { auth0 } from "@/lib/auth0";
import { MessageSquare, ArrowRight, Search, Zap, CheckCircle2, Circle } from "lucide-react";
import { MatrixGrid } from "@/components/ui/matrix-grid";

export default async function ChatListPage() {
  const session = await auth0.getSession();
  const user = session?.user;

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <Link href="/auth/login" className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 bg-gray-900 text-gray-50 shadow hover:bg-gray-900/90 h-9 px-4 py-2">
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  // Use Admin Client to bypass RLS token issues
  const { createAdminClient } = await import("@/lib/supabase-server");
  const supabase = await createAdminClient();

  if (!supabase) {
    return <div className="p-8 text-sm text-red-500 font-medium">System Error: Database connection failed.</div>;
  }

  // Fetch chats
  const { data: chats, error } = await supabase
    .from('chats')
    .select(`
      id,
      created_at,
      status, 
      item:items!chats_item_id_fkey (
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
    .or(`user_a.eq."${user.sub}",user_b.eq."${user.sub}"`)
    .order('created_at', { ascending: false })

  if (error) {
    console.error(error)
    return (
      <div className="min-h-screen bg-[#FAFAFA] pt-24 px-4">
        <div className="max-w-2xl mx-auto p-4 bg-red-50 border border-red-100 rounded-lg flex gap-3 text-red-600 text-sm">
          <Zap className="w-5 h-5" />
          Could not load messages. Please try again later.
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black font-sans text-white relative pt-24">
      <MatrixGrid />

      {/* Header Area */}
      <div className="relative z-10 max-w-3xl mx-auto px-4 py-8 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-display font-medium tracking-tight text-white flex items-center gap-3">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span>
            SECURE INBOX
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-white/40 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 uppercase tracking-wider">
              {chats?.length || 0} Open Channels
            </span>
          </div>
        </div>

        {/* Search Bar (Visual) */}
        <div className="relative group mb-8">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-white/20 group-hover:text-white/40 transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl leading-5 bg-white/5 placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500/50 text-sm transition-all focus:bg-white/10 text-white font-mono"
            placeholder="Scan for communications..."
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-white/20 text-[10px] border border-white/10 rounded px-1.5 py-0.5 font-mono">⌘K</span>
          </div>
        </div>

        {/* List Area */}
        <div className="space-y-4">
          {(!chats || chats.length === 0) ? (
            <div className="text-center py-24 border border-dashed border-white/10 rounded-2xl bg-white/5">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
                <MessageSquare className="h-8 w-8 text-white/20" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">NO SIGNALS DETECTED</h3>
              <p className="text-white/40 text-sm font-mono uppercase tracking-wider mb-6">Start a secure channel from the matrix.</p>
              <Link href="/feed" className="inline-flex items-center justify-center rounded-lg text-xs font-bold font-mono uppercase tracking-wider transition-colors bg-white text-black hover:bg-white/90 h-10 px-8 py-2">
                Access Feed
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {chats.map((chat: any) => {
                const userA = Array.isArray(chat.user_a_data) ? chat.user_a_data[0] : chat.user_a_data
                const userB = Array.isArray(chat.user_b_data) ? chat.user_b_data[0] : chat.user_b_data
                const item = Array.isArray(chat.item) ? chat.item[0] : chat.item
                const otherUser = userA.id === user.sub ? userB : userA
                const isClosed = chat.status === 'CLOSED' || chat.status === 'RESOLVED'

                return (
                  <Link
                    key={chat.id}
                    href={`/chat/${chat.id}`}
                    className="block group"
                  >
                    <div className="relative group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/30 rounded-xl p-4 transition-all duration-300 backdrop-blur-md overflow-hidden">
                      {/* Hover Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      <div className="relative flex items-start gap-4 z-10">
                        {/* Avatar */}
                        <div className="shrink-0 relative">
                          {otherUser.avatar_url ? (
                            <img
                              src={otherUser.avatar_url}
                              alt={otherUser.full_name}
                              className="w-12 h-12 rounded-lg object-cover border border-white/10 shadow-lg grayscale group-hover:grayscale-0 transition-all duration-300"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center text-white/40 font-bold border border-white/10">
                              {otherUser.full_name?.[0] || 'U'}
                            </div>
                          )}
                          {/* Status Dot */}
                          {!isClosed && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-black rounded-full flex items-center justify-center border border-white/10">
                              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="flex items-center justify-between mb-1.5">
                            <h3 className={`text-sm font-medium tracking-tight truncate ${isClosed ? 'text-white/40' : 'text-white group-hover:text-purple-300 transition-colors'}`}>
                              {otherUser.full_name}
                            </h3>
                            <div className="flex items-center gap-2">
                              {isClosed && (
                                <span className="flex items-center gap-1 text-[9px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                  <CheckCircle2 className="w-2.5 h-2.5" /> Resolved
                                </span>
                              )}
                              <span className="text-[10px] font-mono text-white/30 tabular-nums">
                                {formatDistanceToNow(new Date(chat.created_at), { addSuffix: true })}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`shrink-0 text-[9px] font-mono font-bold tracking-wider uppercase px-1.5 py-0.5 rounded border ${item.type === 'LOST'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                              }`}>
                              {item.type}
                            </span>
                            <p className="text-xs text-white/50 truncate font-light">
                              {item.title}
                            </p>
                          </div>
                        </div>

                        {/* Hover Arrow */}
                        <div className="self-center">
                          <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-purple-400 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-300" />
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
