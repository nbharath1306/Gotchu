"use client"

import { useEffect, useState, useRef } from "react"
import { nanoid } from "nanoid"
import { createClient } from "@/lib/supabase"
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

  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true })
      
      if (data) setMessages(data)
    }

    fetchMessages()

    const channel = supabase
      .channel(`chat:${chatId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `chat_id=eq.${chatId}`
      }, (payload) => {
        setMessages((current) => [...current, payload.new as Message])
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [chatId, supabase])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const messageToSend = newMessage.trim()
    setNewMessage("") // Optimistic clear

    const { error } = await supabase
      .from('messages')
      .insert({
        id: nanoid(),
        chat_id: chatId,
        sender_id: currentUserId,
        content: messageToSend
      })

    if (error) {
      console.error('Error sending message:', error)
      setNewMessage(messageToSend) // Restore on error
      return
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
                className={`max-w-[80%] p-3 border-2 border-[#111111] shadow-[4px_4px_0px_0px_#111111] ${
                  isOwn
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
