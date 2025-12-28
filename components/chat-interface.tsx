"use client"

import { useEffect, useState, useRef } from "react"
import { toast } from "sonner"
import {
  Send,
  ArrowLeft,
  MoreHorizontal,
  CheckCheck,
  Check,
  Shield,
  ShieldCheck,
  AlertCircle,
  Clock,
  Paperclip,
  Smile,
  Mic,
  CornerDownLeft,
  X
} from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

// --- TYPES & CONSTANTS ---
interface Message {
  id: string
  content: string
  sender_id: string
  created_at: string
}

interface ChatInterfaceProps {
  chatId: string
  currentUserId: string
  otherUser: {
    full_name: string
    avatar_url: string
  }
  itemTitle: string
}

const AVATAR_PLACEHOLDERS = [
  "bg-rose-100 text-rose-600",
  "bg-indigo-100 text-indigo-600",
  "bg-emerald-100 text-emerald-600",
  "bg-amber-100 text-amber-600",
]

export default function ChatInterface({ chatId, currentUserId, otherUser, itemTitle }: ChatInterfaceProps) {
  // --- STATE ---
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [chatStatus, setChatStatus] = useState("OPEN")
  const [closureRequestedBy, setClosureRequestedBy] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // UI State
  const [isActionsOpen, setIsActionsOpen] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // --- UTILS ---
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // --- EFFECTS ---
  useEffect(() => {
    // Initial fetch & Polling
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/messages?chat_id=${chatId}`)
        if (res.ok) {
          const data = await res.json()
          if (data.messages) setMessages(data.messages)
          if (data.chatStatus) setChatStatus(data.chatStatus)
          setClosureRequestedBy(data.closureRequestedBy || null)
        }
      } catch (err) { console.error("Sync error", err) }
      setIsLoading(false)
    }

    fetchMessages()
    const interval = setInterval(fetchMessages, 2000) // 2s polling for less jitter
    return () => clearInterval(interval)
  }, [chatId])

  useEffect(() => {
    if (!isLoading) scrollToBottom()
  }, [messages, isLoading])

  // --- HANDLERS ---
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value)

    const target = e.target;
    // Reset height to auto to correctly calculate new scrollHeight (shrink behavior)
    target.style.height = 'auto';
    // Calculate optimized height, capped at 160px
    const newHeight = Math.min(target.scrollHeight, 160);
    target.style.height = `${newHeight}px`;
    target.style.overflowY = target.scrollHeight > 160 ? 'auto' : 'hidden';
  }

  const handleEndSession = async () => {
    if (!confirm("Confirm resolution? This will archive the chat.")) return
    try {
      await fetch('/api/chat/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId })
      });
      toast.success("Status updated");
      setIsActionsOpen(false);
    } catch (e) {
      toast.error("Failed to update");
    }
  }

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!newMessage.trim()) return

    const content = newMessage.trim()
    setNewMessage("")

    // Reset Height safely
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    // Optimistic Update
    const optimisticId = "opt-" + Math.random()
    setMessages(prev => [...prev, {
      id: optimisticId,
      content: content,
      sender_id: currentUserId,
      created_at: new Date().toISOString()
    }])
    setTimeout(scrollToBottom, 50)

    try {
      const res = await fetch("/api/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, content: content })
      })
      if (!res.ok) toast.error("Delivery failed")
    } catch (error) {
      toast.error("Delivery failed")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSend()
    }
  }

  // --- RENDER HELPERS ---
  const getRandomColor = (name: string) => {
    const idx = name.length % AVATAR_PLACEHOLDERS.length
    return AVATAR_PLACEHOLDERS[idx]
  }

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA] text-[#111111] font-sans overflow-hidden">

      {/* --- 1. THE COMMAND BAR (Header) --- */}
      <header className="h-[60px] bg-white border-b border-gray-100 flex items-center justify-between px-5 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <Link href="/chat" className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-5 h-5 stroke-[1.5]" />
          </Link>

          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-semibold tracking-tight ${otherUser.avatar_url ? 'bg-gray-100' : getRandomColor(otherUser.full_name || 'U')}`}>
              {otherUser.avatar_url ? (
                <img src={otherUser.avatar_url} className="w-full h-full rounded-lg object-cover" alt="" />
              ) : (
                otherUser.full_name?.[0]
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold tracking-tight text-gray-900">{otherUser.full_name}</h2>
                {chatStatus === 'OPEN' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>}
              </div>
              <p className="text-[11px] font-medium text-gray-400 tracking-wide uppercase">{itemTitle}</p>
            </div>
          </div>
        </div>

        {/* Actions / Status */}
        <div className="flex items-center gap-3">
          {closureRequestedBy && chatStatus === 'OPEN' && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-100 rounded-md">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-xs font-medium text-amber-700">Resolution Pending</span>
            </div>
          )}

          <div className="relative">
            <button
              onClick={() => setIsActionsOpen(!isActionsOpen)}
              className={`w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-500 transition-colors ${isActionsOpen ? 'bg-gray-100 text-gray-900' : ''}`}
            >
              <MoreHorizontal className="w-5 h-5 stroke-[1.5]" />
            </button>

            {/* Dropdown Menu (Pro Style) */}
            {isActionsOpen && (
              <div className="absolute right-0 top-10 w-56 bg-white border border-gray-100 shadow-xl shadow-gray-200/50 rounded-lg py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="px-3 py-2 border-b border-gray-50">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Chat Controls</p>
                </div>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 stroke-[1.5]" />
                  Report User
                </button>

                {chatStatus === 'OPEN' && (
                  <button
                    onClick={handleEndSession}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                  >
                    <Shield className="w-4 h-4 stroke-[1.5]" />
                    {closureRequestedBy ? "Confirm Resolution" : "Mark as Resolved"}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* --- 2. THE STREAM (Content) --- */}
      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 bg-[#FAFAFA]">
        <div className="max-w-3xl mx-auto space-y-8">

          {/* Zero State / Intro */}
          {!isLoading && messages.length === 0 && (
            <div className="text-center py-20 animate-in fade-in zoom-in duration-500">
              <div className="w-16 h-16 bg-white border border-gray-100 rounded-3xl mx-auto flex items-center justify-center mb-4 shadow-sm">
                <ShieldCheck className="w-8 h-8 text-indigo-500 stroke-[1.5]" />
              </div>
              <h3 className="text-gray-900 font-semibold mb-1">Secure Channel</h3>
              <p className="text-xs text-gray-400 font-medium">Messages are end-to-end encrypted.</p>
            </div>
          )}

          {isLoading ? (
            // Skeleton Loader
            <div className="space-y-8 animate-pulse">
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-gray-200 rounded-lg shrink-0" />
                <div className="space-y-2 max-w-[60%]">
                  <div className="h-4 bg-gray-200 rounded w-24" />
                  <div className="h-12 bg-gray-200 rounded-2xl w-full" />
                </div>
              </div>
              <div className="flex gap-4 flex-row-reverse">
                <div className="w-8 h-8 bg-gray-200 rounded-lg shrink-0" />
                <div className="space-y-2 max-w-[60%] flex flex-col items-end">
                  <div className="h-4 bg-gray-200 rounded w-16" />
                  <div className="h-8 bg-gray-200 rounded-2xl w-48" />
                  <div className="h-16 bg-gray-200 rounded-2xl w-64" />
                </div>
              </div>
            </div>
          ) : (
            // Messages Grouped
            <div className="space-y-1">
              {messages.map((msg, i) => {
                const isOwn = msg.sender_id === currentUserId
                const prevMsg = messages[i - 1]

                // Smart Grouping Logic
                const isSameSender = prevMsg && prevMsg.sender_id === msg.sender_id
                const timeDiff = prevMsg ? new Date(msg.created_at).getTime() - new Date(prevMsg.created_at).getTime() : 0
                const isGrouped = isSameSender && timeDiff < 5 * 60 * 1000 // 5 minutes

                // Date Separator Logic
                const showDateSeparator = !prevMsg || new Date(msg.created_at).toDateString() !== new Date(prevMsg.created_at).toDateString()

                return (
                  <div key={msg.id} className="flex flex-col animate-in slide-in-from-bottom-2 fade-in duration-500 fill-mode-backwards" style={{ animationDelay: `${i * 0.05}s` }}>

                    {/* Date Divider */}
                    {showDateSeparator && (
                      <div className="flex items-center justify-center my-6">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                          {format(new Date(msg.created_at), 'MMMM d, yyyy')}
                        </span>
                      </div>
                    )}

                    <div className={`flex gap-3 group/msg ${isOwn ? 'flex-row-reverse' : 'flex-row'} ${isGrouped ? 'mt-0.5' : 'mt-4'}`}>
                      {/* Avatar Gutter */}
                      <div className="shrink-0 w-8 flex flex-col items-center">
                        {!isGrouped ? (
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium shadow-sm border border-black/5 ${isOwn ? 'bg-gray-900 text-white' : 'bg-white text-gray-700'}`}>
                            {isOwn ? 'Me' : otherUser.full_name?.[0]}
                          </div>
                        ) : (
                          <div className="w-8 h-full"></div> // Spacer
                        )}
                      </div>

                      {/* Content Block */}
                      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[80%]`}>
                        {/* Name Header (Only for first in group) */}
                        {!isGrouped && (
                          <div className="flex items-center gap-2 mb-1 px-1">
                            <span className="text-[11px] font-bold text-gray-900">
                              {isOwn ? 'You' : otherUser.full_name}
                            </span>
                            <span className="text-[10px] text-gray-400 tabular-nums">
                              {format(new Date(msg.created_at), 'h:mm a')}
                            </span>
                          </div>
                        )}

                        {/* The Bubble */}
                        <div className={`
                                                relative px-4 py-2 text-[14px] leading-relaxed transition-all break-words whitespace-pre-wrap break-all
                                                ${isOwn
                            ? 'bg-gray-900 text-white rounded-2xl rounded-tr-sm'
                            : 'bg-white text-gray-900 border border-gray-100 shadow-sm rounded-2xl rounded-tl-sm'
                          }
                                                ${isGrouped && isOwn ? 'rounded-tr-2xl mr-0' : ''}
                                                ${isGrouped && !isOwn ? 'rounded-tl-2xl ml-0' : ''}
                                            `}>
                          {msg.content}

                          {/* Timestamp on Hover (for grouped messages) */}
                          {isGrouped && (
                            <div className={`
                                                        absolute top-1/2 -translate-y-1/2 opacity-0 group-hover/msg:opacity-100 transition-opacity text-[9px] text-gray-400 font-medium tabular-nums
                                                        ${isOwn ? '-left-12 text-right w-10' : '-right-12 text-left w-10'}
                                                    `}>
                              {format(new Date(msg.created_at), 'h:mm a')}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Archive Status Banner in Feed (First Class Citizen) */}
          {chatStatus === 'CLOSED' && (
            <div className="flex items-center justify-center py-6">
              <div className="flex items-center gap-3 px-5 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                <CheckCheck className="w-5 h-5 text-gray-400" />
                <div className="text-sm text-gray-500 font-medium">This session has been marked as resolved.</div>
              </div>
            </div>
          )}

          {/* Handover Request Banner in Feed */}
          {closureRequestedBy && chatStatus === 'OPEN' && (
            <div className="flex items-center justify-center py-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="w-full bg-amber-50 border border-amber-100 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  <div>
                    <h4 className="text-sm font-semibold text-amber-900">Resolution Requested</h4>
                    <p className="text-xs text-amber-700/80">
                      {closureRequestedBy === currentUserId
                        ? "You requested to resolve this. Waiting for confirmation."
                        : `${otherUser.full_name} wants to mark this as resolved.`
                      }
                    </p>
                  </div>
                </div>

                {closureRequestedBy !== currentUserId && (
                  <button
                    onClick={handleEndSession}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
                  >
                    Confirm Resolution
                  </button>
                )}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      {/* --- 3. THE COMPOSER (Input) --- */}
      {chatStatus === 'OPEN' ? (
        <div className="bg-white border-t border-gray-100 p-4 sm:px-8 sm:py-6 sticky bottom-0 z-20">
          <div className="max-w-3xl mx-auto">
            <div
              className={`
                            group flex gap-2 bg-white border rounded-xl p-2 transition-all duration-200
                            ${newMessage.trim() ? 'border-gray-300 shadow-sm' : 'border-gray-200 hover:border-gray-300'}
                            focus-within:border-gray-400 focus-within:ring-4 focus-within:ring-gray-50
                        `}
            >
              {/* Attach Button */}
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                <Paperclip className="w-5 h-5 stroke-[1.5]" />
              </button>

              <textarea
                ref={textareaRef}
                value={newMessage}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder="Type request or message..."
                className="flex-1 bg-transparent border-none resize-none px-2 py-2 text-[14px] leading-relaxed placeholder-gray-400 focus:ring-0"
                style={{ minHeight: '44px', maxHeight: '160px' }}
                rows={1}
              />

              {/* Send Button */}
              <button
                onClick={() => handleSend()}
                disabled={!newMessage.trim()}
                className={`
                                p-2 rounded-lg transition-all duration-200 flex items-center justify-center
                                ${newMessage.trim()
                    ? 'bg-gray-900 text-white shadow-sm hover:bg-black'
                    : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                  }
                            `}
              >
                <CornerDownLeft className="w-4 h-4" />
              </button>
            </div>

            <div className="flex justify-between items-center mt-2 px-1">
              <div className="text-[10px] text-gray-400 font-medium tracking-tight">
                <span className="hidden sm:inline">Tip: </span>
                <span className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-200 text-gray-500 font-mono text-[9px] mx-1">⌘ + Enter</span>
                to send
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border-t border-gray-100 p-6 text-center">
          <p className="text-sm font-medium text-gray-500">This conversation has been archived.</p>
        </div>
      )}
    </div>
  )
}
