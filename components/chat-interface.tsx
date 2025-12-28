"use client"

import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase"
import { toast } from "sonner"
import { Send, User } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

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
          // Sync status
          if (data.chatStatus) setChatStatus(data.chatStatus)
          setClosureRequestedBy(data.closureRequestedBy || null)
        }
      } catch (err) {
        console.error("Polling error", err)
      }
    }

    // Initial fetch
    fetchMessages()

    // Poll every 1 second for "live" feel
    const interval = setInterval(fetchMessages, 1000)

    return () => clearInterval(interval)
  }, [chatId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleEndSession = async () => {
    if (confirm("Are you sure you want to end this session?")) {
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
    setNewMessage("") // Clear input immediately

    // Optimistic Update
    const optimisticMsg: Message = {
      id: "optimistic-" + Math.random(),
      content: messageContent,
      sender_id: currentUserId,
      created_at: new Date().toISOString()
    }
    setMessages(prev => [...prev, optimisticMsg])
    // Scroll immediately
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
        // Remove optimistic message on failure? Or just let it be and let user retry? 
        // For simplicity, we leave it but maybe show error.
        return
      }
      // Success - let polling sync the ID later.
    } catch (error: any) {
      console.error('Error sending message:', error)
      toast.error(error.message || "Failed to send message")
    }
  }

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Handover Status Bar */}
      {chatStatus === 'OPEN' && (
        <div className="absolute top-2 right-4 z-20">
          {!closureRequestedBy ? (
            <button onClick={handleEndSession} className="text-xs bg-white border border-red-500 text-red-500 px-3 py-1 hover:bg-red-500 hover:text-white transition-colors uppercase tracking-wider font-bold">
              End Session
            </button>
          ) : closureRequestedBy === currentUserId ? (
            <span className="text-xs bg-gray-100 text-gray-400 px-3 py-1 border border-gray-200 cursor-not-allowed uppercase tracking-wider font-bold">
              Waiting for closure...
            </span>
          ) : (
            <button onClick={handleEndSession} className="text-xs bg-red-600 text-white border border-red-600 px-3 py-1 animate-pulse hover:bg-red-700 uppercase tracking-wider font-bold shadow-lg">
              Confirm End Session
            </button>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pt-10">
        {/* Added top padding to clear the button */}
        {messages.map((message) => {
          const isOwn = message.sender_id === currentUserId
          return (
            <div
              key={message.id}
              className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] p-3 border-2 border-[#111111] shadow-[4px_4px_0px_0px_#111111] ${isOwn
                  ? "bg-[#111111] text-white"
                  : "bg-white text-[#111111]"
                  }`}
              >
                <p className="text-sm font-medium">{message.content}</p>
                <p className={`text-[10px] mt-1 font-mono opacity-70 ${isOwn ? "text-gray-300" : "text-gray-500"}`}>
                  {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          )
        })}

        {chatStatus === 'CLOSED' && (
          <div className="flex justify-center my-4">
            <div className="px-4 py-2 bg-gray-100 border border-gray-300 text-gray-500 font-mono text-xs uppercase tracking-widest">
              SESSION ENDED
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-[#F2F2F2] border-t-2 border-[#111111]">
        {chatStatus === 'OPEN' ? (
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              disabled={closureRequestedBy === currentUserId} /* Disable if I already requested */
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={closureRequestedBy === currentUserId ? "Waiting for other user..." : "Type a message..."}
              className="flex-1 p-3 bg-white border-2 border-[#111111] focus:outline-none focus:ring-0 focus:border-[#FF4F4F] transition-colors font-mono text-sm disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || !!closureRequestedBy}
              className="p-3 bg-[#111111] text-white border-2 border-[#111111] hover:bg-[#FF4F4F] hover:border-[#FF4F4F] disabled:opacity-50 disabled:hover:bg-[#111111] disabled:hover:border-[#111111] transition-all shadow-[2px_2px_0px_0px_#666666] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px]"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        ) : (
          <div className="p-4 bg-[#F2F2F2] border-t-2 border-[#111111] text-center w-full">
            <p className="text-[#666666] font-mono text-sm uppercase">This conversation has been closed.</p>
          </div>
        )}
      </div>
    </div>
  )
}
