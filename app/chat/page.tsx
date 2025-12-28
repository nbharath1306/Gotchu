export const dynamic = 'force-dynamic'

import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { auth0 } from "@/lib/auth0";
import { MessageSquare, ArrowRight, Search, Zap, CheckCircle2, Circle } from "lucide-react";

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
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-gray-900">

      {/* Header Area */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold tracking-tight text-gray-900">Inbox</h1>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100 uppercase tracking-wider">
                {chats?.length || 0} Open
              </span>
            </div>
          </div>

          {/* Search Bar (Visual) */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400 group-hover:text-gray-500 transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-300 sm:text-sm transition-shadow shadow-sm group-hover:border-gray-300"
              placeholder="Search messages..."
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-400 text-xs border border-gray-200 rounded px-1.5 py-0.5">⌘K</span>
            </div>
          </div>
        </div>
      </div>

      {/* List Area */}
      <div className="max-w-3xl mx-auto px-4 py-6 sm:px-6">
        {(!chats || chats.length === 0) ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
              <MessageSquare className="h-7 w-7 text-gray-300" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">No messages yet</h3>
            <p className="text-sm text-gray-500 mt-1 mb-6">Start a conversation from an item listing.</p>
            <Link href="/feed" className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors bg-gray-900 text-white hover:bg-gray-800 h-9 px-6 py-2 shadow-sm">
              Browse Items
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
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
                  className="block group relative"
                >
                  <div className="bg-white hover:bg-gray-50/80 border border-gray-100 hover:border-gray-200 rounded-xl p-4 transition-all duration-200 shadow-sm hover:shadow-md flex items-start gap-4">
                    {/* Avatar */}
                    <div className="shrink-0 relative">
                      {otherUser.avatar_url ? (
                        <img
                          src={otherUser.avatar_url}
                          alt={otherUser.full_name}
                          className="w-12 h-12 rounded-xl object-cover border border-gray-100 shadow-sm"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 font-semibold border border-gray-100">
                          {otherUser.full_name?.[0] || 'U'}
                        </div>
                      )}
                      {/* Status Dot */}
                      {!isClosed && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white"></div>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`text-sm font-semibold truncate ${isClosed ? 'text-gray-500' : 'text-gray-900'}`}>
                          {otherUser.full_name}
                        </h3>
                        <div className="flex items-center gap-2">
                          {isClosed && (
                            <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                              <CheckCircle2 className="w-3 h-3" /> Resolved
                            </span>
                          )}
                          <span className="text-[11px] text-gray-400 tabular-nums">
                            {formatDistanceToNow(new Date(chat.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`shrink-0 text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded border ${item.type === 'LOST'
                            ? 'bg-rose-50 text-rose-600 border-rose-100'
                            : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                          }`}>
                          {item.type}
                        </span>
                        <p className="text-xs text-gray-500 truncate">
                          {item.title}
                        </p>
                      </div>
                    </div>

                    {/* Hover Arrow */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-200">
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </div>
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
