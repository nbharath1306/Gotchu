"use client"

import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase"
import { toast } from "sonner"
import { Send, ArrowLeft, ShieldCheck, ShieldAlert, Lock, MoreHorizontal, Image as ImageIcon, Paperclip, Check } from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
import Link from "next/link"

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

export default function ChatInterface({ chatId, currentUserId, otherUser, itemTitle }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [chatStatus, setChatStatus] = useState("OPEN")
  const [closureRequestedBy, setClosureRequestedBy] = useState<string | null>(null)

  // UI States
  const [isSafetyPanelOpen, setIsSafetyPanelOpen] = useState(false)

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

  // Auto-open safety panel if partner requested closure
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
      if (!res.ok) {
        toast.error("Failed to send message")
      }
    } catch (error: any) {
      console.error('Error sending message:', error)
      toast.error("Failed to send message")
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA] relative font-sans text-gray-900">

      {/* 1. Header: Organic & Airy */}
      <header className="px-6 py-4 bg-[#FAFAFA]/90 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between border-b border-gray-100 transition-all">
        <div className="flex items-center gap-4">
          <Link href="/chat" className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-all text-gray-500 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden shadow-sm border-2 border-white ring-1 ring-gray-100">
                {otherUser.avatar_url ? (
                  <img src={otherUser.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white font-medium text-lg">
                    {otherUser.full_name?.[0]}
                  </div>
                )}
              </div>
              {/* Status Dot */}
              <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${chatStatus === 'OPEN' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            </div>

            <div>
              <h1 className="font-semibold text-lg leading-tight tracking-tight text-gray-900">
                {otherUser.full_name}
              </h1>
              <p className="text-xs font-medium text-gray-500 tracking-wide uppercase">
                {itemTitle}
              </p>
            </div>
          </div>
        </div>

        {/* Trust & Safety Toggle */}
        <button
          onClick={() => setIsSafetyPanelOpen(!isSafetyPanelOpen)}
          className={`
                group flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300
                ${isSafetyPanelOpen ? 'bg-gray-900 text-white shadow-lg' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:shadow-sm'}
            `}
        >
          {chatStatus === 'OPEN' ? (
            closureRequestedBy ? (
              <>
                <ShieldAlert className="w-4 h-4 animate-pulse text-orange-400" />
                <span className="text-xs font-bold tracking-wide">Action Req</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold tracking-wide hidden sm:block">Safety</span>
              </>
            )
          ) : (
            <>
              <Lock className="w-4 h-4" />
              <span className="text-xs font-bold tracking-wide">Archived</span>
            </>
          )}
        </button>
      </header>

      {/* Safety Control Panel (Collapsible/Floating) */}
      <div className={`
          overflow-hidden transition-all duration-500 ease-in-out border-b border-gray-100 bg-white
          ${isSafetyPanelOpen ? 'max-h-[200px] opacity-100 shadow-sm' : 'max-h-0 opacity-0'}
      `}>
        <div className="p-6 max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Secure Handover Protocol</h3>
              <p className="text-xs text-gray-500 leading-relaxed max-w-md mt-1">
                {chatStatus === 'CLOSED'
                  ? "This session has been securely closed. No further messages can be exchanged."
                  : closureRequestedBy
                    ? closureRequestedBy === currentUserId
                      ? "You have requested to close this session. Waiting for the other party to confirm."
                      : "The other party has requested to close this session. Please confirm if the item handover is complete."
                    : "Once the item is found or returned, please end the session to secure your data and prevent spam."
                }
              </p>
            </div>
          </div>

          {chatStatus === 'OPEN' && (
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                onClick={() => setIsSafetyPanelOpen(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex-1 sm:flex-none border border-transparent hover:border-gray-200"
              >
                Discuss
              </button>

              <button
                onClick={handleEndSession}
                disabled={closureRequestedBy === currentUserId}
                className={`
                            px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg shadow-red-500/20 active:scale-95 transition-all flex-1 sm:flex-none flex items-center justify-center gap-2
                            ${closureRequestedBy === currentUserId
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-red-500 hover:bg-red-600'
                  }
                        `}
              >
                {closureRequestedBy ? "Confirm Handover" : "End Session"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Messages: Spacious & Clean */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
        {/* System Note */}
        <div className="flex justify-center">
          <div className="bg-gray-100/80 backdrop-blur text-gray-500 text-[10px] font-medium px-4 py-1.5 rounded-full uppercase tracking-widest">
            Dec 29 &bull; Encrypted
          </div>
        </div>

        {messages.map((message, i) => {
          const isOwn = message.sender_id === currentUserId
          const isSeq = i > 0 && messages[i - 1].sender_id === message.sender_id

          return (
            <div key={message.id} className={`flex w-full ${isOwn ? "justify-end" : "justify-start"} group animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className={`
                    max-w-[80%] sm:max-w-[70%] relative px-5 py-3.5 text-[15px] leading-relaxed
                    ${isOwn
                  ? "bg-[#18181b] text-white rounded-2xl rounded-tr-sm shadow-md shadow-gray-200/50" // Zinc-900
                  : "bg-white text-gray-900 border border-gray-100 rounded-2xl rounded-tl-sm shadow-sm"
                }
                    ${isSeq && isOwn ? "mt-1 rounded-tr-2xl" : ""}
                    ${isSeq && !isOwn ? "mt-1 rounded-tl-2xl" : ""}
                 `}>
                {message.content}

                <div className={`mt-1.5 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity ${isOwn ? "justify-end" : "justify-start"}`}>
                  <span className={`text-[9px] font-medium tracking-wide uppercase ${isOwn ? "text-gray-400" : "text-gray-400"}`}>
                    {format(new Date(message.created_at), "h:mm a")}
                  </span>
                  {isOwn && <Check className="w-3 h-3 text-emerald-500" />}
                </div>
              </div>
            </div>
          )
        })}

        {chatStatus === 'CLOSED' && (
          <div className="flex flex-col items-center justify-center py-12 opacity-80">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-300">
              <Lock className="w-8 h-8" />
            </div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">Discussion Closed</p>
            <p className="text-xs text-gray-400 mt-1">This thread is read-only.</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 3. Input Island: Floating & Modern */}
      <div className="p-4 sm:p-6 bg-gradient-to-t from-[#FAFAFA] to-transparent sticky bottom-0 z-20">
        {chatStatus === 'OPEN' ? (
          <form onSubmit={handleSend} className="max-w-4xl mx-auto relative group">
            <div className="absolute inset-0 bg-white shadow-xl shadow-gray-200/50 rounded-2xl transition-shadow group-hover:shadow-2xl group-hover:shadow-gray-300/50"></div>

            <div className="relative flex items-center p-2 gap-2">
              {/* Addons */}
              <button type="button" className="p-3 text-gray-400 hover:text-gray-900 bg-transparent hover:bg-gray-50 rounded-xl transition-colors">
                <Paperclip className="w-5 h-5" />
              </button>

              <input
                type="text"
                value={newMessage}
                disabled={closureRequestedBy === currentUserId}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={closureRequestedBy === currentUserId ? "Waiting for response..." : "Type your message..."}
                className="flex-1 bg-transparent border-0 focus:ring-0 text-gray-900 placeholder-gray-400 text-base font-regular py-3"
              />

              <button
                type="submit"
                disabled={!newMessage.trim() || !!closureRequestedBy}
                className={`
                            p-3 rounded-xl transition-all duration-200 flex items-center justify-center
                            ${newMessage.trim()
                    ? 'bg-[#18181b] text-white shadow-lg hover:scale-105 active:scale-95' // Zinc-900
                    : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                  }
                        `}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        ) : (
          <div className="max-w-xl mx-auto bg-gray-100 rounded-2xl p-4 text-center">
            <p className="text-gray-500 text-sm font-medium">This session has been archived.</p>
          </div>
        )}
      </div>
    </div>
  )
}
