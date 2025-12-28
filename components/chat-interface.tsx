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
  const supabase = createClient()
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
          if (data.messages) {
            setMessages(data.messages)
          }
        }
      } catch (err) {
        console.error("Polling error", err)
      }
    }

    // Initial fetch
    fetchMessages()

    // Poll every 3 seconds
    const interval = setInterval(fetchMessages, 3000)

    return () => clearInterval(interval)
  }, [chatId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-[#F2F2F2] border-t-2 border-[#111111]">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-3 bg-white border-2 border-[#111111] focus:outline-none focus:ring-0 focus:border-[#FF4F4F] transition-colors font-mono text-sm"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="p-3 bg-[#111111] text-white border-2 border-[#111111] hover:bg-[#FF4F4F] hover:border-[#FF4F4F] disabled:opacity-50 disabled:hover:bg-[#111111] disabled:hover:border-[#111111] transition-all shadow-[2px_2px_0px_0px_#666666] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px]"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  )
}
