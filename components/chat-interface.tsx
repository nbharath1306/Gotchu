"use client"

import { useEffect, useState, useRef } from "react"
import { toast } from "sonner"
import { Send, ArrowLeft, ShieldCheck, ShieldAlert, Lock, MoreHorizontal, Image as ImageIcon, Paperclip, Check, CheckCheck, Sparkles, MapPin, BadgeCheck, Zap } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

// --- TYPES ---
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

// --- VISUAL ASSETS ---
// A subtle noise texture for that "premium" feel
const NOISE_SVG = `data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E`

export default function ChatInterface({ chatId, currentUserId, otherUser, itemTitle }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [chatStatus, setChatStatus] = useState("OPEN")
  const [closureRequestedBy, setClosureRequestedBy] = useState<string | null>(null)

  // UI Complex States
  const [isSafetyPanelOpen, setIsSafetyPanelOpen] = useState(false)
  const [isInputFocused, setIsInputFocused] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Polling logic
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/messages?chat_id=${chatId}`)
        if (res.ok) {
          const data = await res.json()
          if (data.messages) setMessages(data.messages)
          if (data.chatStatus) setChatStatus(data.chatStatus)
          setClosureRequestedBy(data.closureRequestedBy || null)
        }
      } catch (err) {
        console.error("Polling error", err)
      }
    }

    fetchMessages()
    const interval = setInterval(fetchMessages, 1000)
    return () => clearInterval(interval)
  }, [chatId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (closureRequestedBy && closureRequestedBy !== currentUserId && chatStatus === 'OPEN') {
      setIsSafetyPanelOpen(true)
    }
  }, [closureRequestedBy, chatStatus, currentUserId])

  const handleEndSession = async () => {
    try {
      await fetch('/api/chat/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId })
      });
      toast.success(closureRequestedBy ? "Session ended securely." : "Closure request sent.");
      setIsSafetyPanelOpen(false);
    } catch (e) {
      toast.error("Failed to update session.");
    }
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const messageContent = newMessage.trim()
    setNewMessage("")

    const optimisticMsg: Message = {
      id: "optimistic-" + Math.random(),
      content: messageContent,
      sender_id: currentUserId,
      created_at: new Date().toISOString()
    }
    setMessages(prev => [...prev, optimisticMsg])
    setTimeout(scrollToBottom, 50)

    try {
      const res = await fetch("/api/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, content: messageContent })
      })
      if (!res.ok) toast.error("Failed to send")
    } catch (error: any) {
      toast.error("Failed to send")
    }
  }

  return (
    <div className="flex flex-col h-full relative font-sans text-[#0f172a] overflow-hidden bg-slate-50 selection:bg-indigo-100 selection:text-indigo-900">

      {/* --- ATMOSPHERE LAYER --- */}
      {/* 1. Gradient Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-200/30 blur-[120px] pointer-events-none mix-blend-multiply animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-200/30 blur-[120px] pointer-events-none mix-blend-multiply" />

      {/* 2. Noise Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40 mix-blend-overlay" style={{ backgroundImage: `url("${NOISE_SVG}")` }}></div>

      {/* --- HEADER: GLASS COMMAND CENTER --- */}
      <header className="relative z-30 shrink-0">
        <div className="absolute inset-0 bg-white/70 backdrop-blur-xl border-b border-indigo-50/50 shadow-sm"></div>

        <div className="relative px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <Link href="/chat" className="group p-2.5 -ml-2 rounded-xl hover:bg-white/80 hover:shadow-sm transition-all text-slate-500 hover:text-indigo-600 border border-transparent hover:border-indigo-50">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            </Link>

            <div className="flex items-center gap-4">
              {/* Complex Avatar Stack */}
              <div className="relative group cursor-pointer">
                <div className="absolute -inset-0.5 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-500"></div>
                <div className="relative w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden border-2 border-white shadow-sm transition-transform group-hover:scale-[1.02]">
                  {otherUser.avatar_url ? (
                    <img src={otherUser.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-900 text-white font-bold text-lg">
                      {otherUser.full_name?.[0]}
                    </div>
                  )}
                </div>
                {/* Live Indicator */}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <div className={`w-3 h-3 rounded-full ${chatStatus === 'OPEN' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="font-bold text-lg leading-tight text-slate-900 tracking-tight">
                    {otherUser.full_name}
                  </h1>
                  <BadgeCheck className="w-4 h-4 text-sky-500 fill-sky-500/10" />
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100/50 uppercase tracking-wider">
                    {itemTitle}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Safety Toggle */}
          <button
            onClick={() => setIsSafetyPanelOpen(!isSafetyPanelOpen)}
            className={`
                    relative overflow-hidden group flex items-center gap-2.5 px-5 py-2.5 rounded-2xl transition-all duration-300 border border-transparent
                    ${isSafetyPanelOpen
                ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20'
                : 'bg-white text-slate-600 hover:text-slate-900 hover:border-slate-200 shadow-sm hover:shadow-md'
              }
                `}
          >
            {/* Shine effect */}
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>

            {chatStatus === 'OPEN' ? (
              closureRequestedBy ? (
                <>
                  <ShieldAlert className="w-4 h-4 text-amber-500 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wide">Pending</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs font-bold uppercase tracking-wide hidden sm:block">Protection</span>
                </>
              )
            ) : (
              <>
                <Lock className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold uppercase tracking-wide">Archived</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* --- TRANSACTION LIFECYCLE PANEL --- */}
      <div className={`
          relative z-20 transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) overflow-hidden
          ${isSafetyPanelOpen ? 'max-h-[300px] opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-4'}
      `}>
        <div className="absolute inset-0 bg-white/90 backdrop-blur-md border-b border-indigo-100"></div>
        <div className="relative p-6 sm:p-8 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">

            {/* Status Steps */}
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center gap-2 mt-1">
                  <div className={`w-3 h-3 rounded-full ${chatStatus === 'OPEN' ? 'bg-emerald-500 ring-4 ring-emerald-500/20' : 'bg-slate-300'}`}></div>
                  <div className="w-0.5 h-full bg-slate-100 min-h-[40px]"></div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Conversation Active</h4>
                  <p className="text-xs text-slate-500 mt-1">Chat is secure and encrypted. Discuss retrieval details.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center gap-2 mt-1">
                  <div className={`w-3 h-3 rounded-full transition-colors ${closureRequestedBy ? 'bg-amber-500 ring-4 ring-amber-500/20' : 'bg-slate-200'}`}></div>
                  <div className="w-0.5 h-full bg-slate-100 min-h-[40px]"></div>
                </div>
                <div>
                  <h4 className={`text-sm font-bold ${closureRequestedBy ? 'text-amber-600' : 'text-slate-400'}`}>Handover Verification</h4>
                  <p className="text-xs text-slate-500 mt-1">Both parties must confirm the item transfer.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className={`w-3 h-3 rounded-full mt-1 ${chatStatus === 'CLOSED' ? 'bg-indigo-600 ring-4 ring-indigo-600/20' : 'bg-slate-200'}`}></div>
                <div>
                  <h4 className={`text-sm font-bold ${chatStatus === 'CLOSED' ? 'text-indigo-600' : 'text-slate-400'}`}>Session Archived</h4>
                </div>
              </div>
            </div>

            {/* Actions Card */}
            {chatStatus === 'OPEN' && (
              <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
                <h3 className="text-base font-bold text-slate-900 mb-2">Ready to finish?</h3>
                <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                  {closureRequestedBy
                    ? "A request to end the session is pending. If you have exchanged the item, please confirm below to lock this thread."
                    : "Only end the session once the item has been physically returned. This action is irreversible."}
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setIsSafetyPanelOpen(false)}
                    className="flex-1 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wide rounded-xl transition-colors"
                  >
                    Continue Chat
                  </button>
                  <button
                    onClick={handleEndSession}
                    disabled={closureRequestedBy === currentUserId}
                    className={`
                                    flex-1 py-3 text-white text-xs font-bold uppercase tracking-wide rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2
                                    ${closureRequestedBy === currentUserId
                        ? 'bg-slate-300 cursor-not-allowed'
                        : 'bg-red-500 hover:bg-red-600 shadow-red-500/20'
                      }
                                `}
                  >
                    {closureRequestedBy && closureRequestedBy !== currentUserId && <Lock className="w-3 h-3" />}
                    {closureRequestedBy ? "Confirm" : "End Session"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- CHAT SCROLLER --- */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-0 py-6 scroll-smooth scrollbar-thin scrollbar-thumb-indigo-100 scrollbar-track-transparent">
        <div className="max-w-3xl mx-auto space-y-8">

          {/* Encryption Notice */}
          <div className="flex justify-center">
            <div className="flex items-center gap-2 px-4 py-1.5 bg-yellow-50 text-yellow-700 rounded-full border border-yellow-100/50 shadow-sm">
              <Lock className="w-3 h-3" />
              <span className="text-[10px] font-bold uppercase tracking-widest">End-to-End Encrypted</span>
            </div>
          </div>

          {/* Messages */}
          <div className="space-y-4 px-2 sm:px-6">
            {messages.map((message, i) => {
              const isOwn = message.sender_id === currentUserId
              const isSeq = i > 0 && messages[i - 1].sender_id === message.sender_id

              return (
                <div key={message.id} className={`flex w-full ${isOwn ? "justify-end" : "justify-start"} group perspective-[1000px]`}>
                  <div className={`
                                relative max-w-[85%] sm:max-w-[70%] text-[15px] leading-relaxed transition-all duration-300 hover:scale-[1.01] hover:shadow-md
                                ${isOwn
                      ? "bg-slate-900 text-white rounded-[20px] rounded-tr-sm shadow-xl shadow-slate-900/10 origin-bottom-right"
                      : "bg-white text-slate-800 border border-slate-100 rounded-[20px] rounded-tl-sm shadow-lg shadow-slate-200/50 origin-bottom-left"
                    }
                                ${isSeq && isOwn ? "mt-1 rounded-tr-[20px]" : ""}
                                ${isSeq && !isOwn ? "mt-1 rounded-tl-[20px]" : ""}
                            `}>
                    <div className="px-5 py-3.5 break-words">
                      {message.content}
                    </div>
                    <div className={`
                                    px-4 pb-2 pt-0 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300
                                    ${isOwn ? "justify-end text-slate-400" : "justify-start text-slate-300"}
                                `}>
                      <span className="text-[9px] font-bold tracking-wider uppercase">
                        {format(new Date(message.created_at), "h:mm a")}
                      </span>
                      {isOwn && <CheckCheck className="w-3 h-3 text-emerald-400" />}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {chatStatus === 'CLOSED' && (
            <div className="flex flex-col items-center justify-center py-12 opacity-60 grayscale transition-all duration-1000">
              <div className="w-20 h-20 bg-slate-100 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner ring-4 ring-white">
                <BadgeCheck className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Case Solved</h3>
              <p className="text-sm text-slate-500 font-medium">This transaction has been finalized.</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* --- LEVITATING INPUT --- */}
      <div className="relative z-40 p-4 sm:p-6 sm:pb-8">
        {chatStatus === 'OPEN' ? (
          <div className="max-w-3xl mx-auto">
            <form
              onSubmit={handleSend}
              className={`
                        relative bg-white rounded-[2rem] shadow-2xl transition-all duration-300 ease-out border border-transparent
                        ${isInputFocused ? 'scale-[1.01] shadow-indigo-500/10 border-indigo-100 ring-4 ring-indigo-500/5' : 'shadow-slate-200/50'}
                    `}
            >
              <div className="flex items-center p-2.5 pl-4 gap-3">
                {/* Tooltip-style Addons */}
                <div className="flex items-center gap-1 pr-3 border-r border-slate-100">
                  <button type="button" className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <button type="button" className="p-2 text-slate-400 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition-all">
                    <ImageIcon className="w-5 h-5" />
                  </button>
                </div>

                <input
                  type="text"
                  value={newMessage}
                  disabled={closureRequestedBy === currentUserId}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={closureRequestedBy === currentUserId ? "Waiting for partner..." : "Type your message..."}
                  className="flex-1 bg-transparent border-none text-base text-slate-800 placeholder-slate-400 focus:ring-0 py-3"
                />

                <button
                  type="submit"
                  disabled={!newMessage.trim() || !!closureRequestedBy}
                  className={`
                                p-3.5 rounded-full transition-all duration-300 flex items-center justify-center
                                ${newMessage.trim()
                      ? 'bg-gradient-to-tr from-slate-900 to-indigo-900 text-white shadow-lg shadow-indigo-900/20 hover:scale-110 active:scale-95'
                      : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                    }
                            `}
                >
                  {newMessage.trim() ? <Send className="w-5 h-5 ml-0.5" /> : <MoreHorizontal className="w-5 h-5" />}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            <div className="bg-slate-900/5 backdrop-blur-sm border border-slate-200/50 rounded-2xl p-4 text-center">
              <p className="text-slate-500 text-sm font-semibold tracking-tight">Archive Mode &bull; Read Only</p>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
