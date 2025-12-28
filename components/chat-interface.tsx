"use client"

import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase"
import { toast } from "sonner"
import { Send, ArrowLeft, ShieldAlert, CheckCircle2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
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

  const handleEndSession = async () => {
    if (confirm("Are you sure you want to end this session? This cannot be undone.")) {
      try {
        await fetch('/api/chat/close', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId })
        });
        toast.success("Request sent.");
      } catch (e) {
        toast.error("Failed to update session.");
      }
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
        const data = await res.json()
        toast.error(data.error || "Failed to send message")
      }
    } catch (error: any) {
      console.error('Error sending message:', error)
      toast.error(error.message || "Failed to send message")
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA]">

      {/* HEADER */}
      <div className="bg-white border-b border-[#E5E5E5] px-4 py-3 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/chat" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-[#111111]">
            <ArrowLeft className="w-5 h-5" />
          </Link>

          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-[#111111] text-white flex items-center justify-center font-bold text-lg overflow-hidden border border-gray-200">
            {otherUser.avatar_url ? (
              <img src={otherUser.avatar_url} alt={otherUser.full_name} className="w-full h-full object-cover" />
            ) : (
              otherUser.full_name?.[0] || '?'
            )}
          </div>

          <div className="leading-tight">
            <h1 className="font-bold text-[#111111] text-sm">{otherUser.full_name}</h1>
            <p className="text-xs text-[#666666] font-mono truncate max-w-[150px] sm:max-w-[200px]">{itemTitle}</p>
          </div>
        </div>

        {/* ACTION BUTTON */}
        {chatStatus === 'OPEN' && (
          <div>
            {!closureRequestedBy ? (
              <button onClick={handleEndSession} className="text-[10px] sm:text-xs font-bold border border-red-200 text-red-500 px-3 py-1.5 rounded-full hover:bg-red-50 transition-colors uppercase tracking-wide flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" />
                End Session
              </button>
            ) : closureRequestedBy === currentUserId ? (
              <span className="text-[10px] bg-gray-100 text-gray-400 px-3 py-1.5 rounded-full border border-gray-200 cursor-not-allowed uppercase tracking-wide flex items-center gap-2">
                Waiting...
              </span>
            ) : (
              <button onClick={handleEndSession} className="text-[10px] sm:text-xs font-bold bg-red-600 text-white px-4 py-1.5 rounded-full hover:bg-red-700 transition-colors uppercase tracking-wide shadow-md animate-pulse flex items-center gap-2">
                Confirm End
              </button>
            )}
          </div>
        )}
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 sm:p-6">
        {messages.map((message) => {
          const isOwn = message.sender_id === currentUserId
          return (
            <div key={message.id} className={`flex gap-3 ${isOwn ? "justify-end" : "justify-start"}`}>
              {/* Other User Avatar (Only show if not own) */}
              {!isOwn && (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 mt-1 overflow-hidden">
                  {otherUser.avatar_url ? (
                    <img src={otherUser.avatar_url} alt="Av" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-gray-500">
                      {otherUser.full_name?.[0]}
                    </div>
                  )}
                </div>
              )}

              <div className={`max-w-[75%] sm:max-w-[65%] group`}>
                <div className={`
                    p-3 sm:px-4 sm:py-3 rounded-2xl shadow-sm text-sm leading-relaxed
                    ${isOwn
                    ? "bg-[#111111] text-white rounded-tr-sm"
                    : "bg-white text-[#111111] border border-gray-200 rounded-tl-sm"
                  }
                `}>
                  {message.content}
                </div>
                <p className={`text-[10px] mt-1 px-1 font-mono opacity-0 group-hover:opacity-60 transition-opacity ${isOwn ? "text-right" : "text-left"}`}>
                  {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          )
        })}

        {chatStatus === 'CLOSED' && (
          <div className="flex flex-col items-center justify-center py-8 gap-2 opacity-60">
            <CheckCircle2 className="w-8 h-8 text-gray-400" />
            <span className="text-xs font-mono uppercase tracking-widest text-gray-500">Session Completed</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <div className="p-4 bg-white border-t border-[#E5E5E5]">
        {chatStatus === 'OPEN' ? (
          <form onSubmit={handleSend} className="max-w-4xl mx-auto flex gap-3 items-center">
            <input
              type="text"
              value={newMessage}
              disabled={closureRequestedBy === currentUserId}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={closureRequestedBy === currentUserId ? "Waiting for closure..." : "Type your message..."}
              className="flex-1 bg-[#F5F5F5] border-0 rounded-full px-5 py-3 text-sm focus:ring-2 focus:ring-[#111111] focus:bg-white transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || !!closureRequestedBy}
              className="p-3 bg-[#111111] text-white rounded-full hover:bg-black hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-lg"
            >
              <Send className="h-5 w-5 ml-0.5" />
            </button>
          </form>
        ) : (
          <div className="text-center py-2">
            <p className="text-xs font-mono text-gray-400 uppercase tracking-widest">Chat is read-only</p>
          </div>
        )}
      </div>
    </div>
  )
}
