```
"use client"

import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase"
import { toast } from "sonner"
import { Send, ArrowLeft, MoreVertical, Phone, Video, ShieldBan, CheckCheck, Clock } from "lucide-react"
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
  const [showMenu, setShowMenu] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Polling logic
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/ api / messages ? chat_id = ${ chatId } `)
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
      if (confirm("Are you sure you want to end this session? This action is irreversible.")) {
        try {
            await fetch('/api/chat/close', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: chatId })
            });
            setShowMenu(false);
            toast.success("Request sent.");
        } catch(e) {
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
        toast.error("Failed to send message")
      }
    } catch (error: any) {
      console.error('Error sending message:', error)
      toast.error("Failed to send message")
    }
  }

  // Background Pattern for "WhatsApp" feel
  const bgPattern = {
    backgroundColor: "#E5DDD5",
    backgroundImage: `url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")`,
    backgroundBlendMode: "overlay",
    opacity: 0.9
  }

  return (
    <div className="flex flex-col h-full relative font-sans">
      
      {/* 1. HEADER (WhatsApp Style) */}
      <header className="bg-[#008069] text-white px-4 py-2 flex items-center justify-between shadow-md z-30 shrink-0">
         <div className="flex items-center gap-2">
             <Link href="/chat" className="p-1 -ml-1 hover:bg-white/10 rounded-full transition-colors">
                <ArrowLeft className="w-6 h-6" />
             </Link>
             
             <div className="flex items-center gap-3 ml-1 cursor-pointer">
                 {/* Avatar */}
                 <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden border border-white/20">
                    {otherUser.avatar_url ? (
                        <img src={otherUser.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-[#008069] font-bold text-lg">
                           {otherUser.full_name?.[0]}
                        </div>
                    )}
                 </div>
                 
                 {/* Info */}
                 <div className="flex flex-col">
                     <h1 className="font-semibold text-[16px] leading-tight truncate max-w-[180px]">
                        {otherUser.full_name}
                     </h1>
                     <p className="text-[12px] text-white/80 truncate max-w-[150px]">
                        {chatStatus === 'OPEN' ? 'online' : 'Session Ended'}
                     </p>
                 </div>
             </div>
         </div>

         <div className="flex items-center gap-4">
            {/* Fake Call Icons for authenticity */}
            <Phone className="w-5 h-5 text-white/90 cursor-not-allowed opacity-70" />
            <Video className="w-6 h-6 text-white/90 cursor-not-allowed opacity-70" />
            
            {/* Menu */}
            <div className="relative">
                <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <MoreVertical className="w-6 h-6" />
                </button>
                
                {showMenu && (
                    <div className="absolute right-0 top-12 bg-white text-gray-800 shadow-xl rounded-lg py-2 w-48 z-40 animate-in fade-in slide-in-from-top-2 border border-black/5 origin-top-right">
                         <div className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm">View Item</div>
                         <div className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm">Media, links, and docs</div>
                         <div className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm">Search</div>
                         <div className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm">Mute notifications</div>
                         <div className="h-px bg-gray-100 my-1" />
                         {chatStatus === 'OPEN' && (
                             <button 
                                onClick={handleEndSession}
                                className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-500 text-sm font-medium flex items-center gap-2"
                             >
                                <ShieldBan className="w-4 h-4" />
                                {closureRequestedBy === currentUserId ? 'Cancel Closure Req' : closureRequestedBy ? 'Confirm End Session' : 'End Session'}
                             </button>
                         )}
                    </div>
                )}
            </div>
         </div>
      </header>

      {/* 2. Chat Area */}
      <div className="flex-1 overflow-y-auto relative bg-[#E5DDD5]">
         {/* Doodle Background Layer */}
         <div className="absolute inset-0 z-0 opacity-40 pointer-events-none grayscale" style={{ backgroundImage: bgPattern.backgroundImage, backgroundRepeat: 'repeat' }}></div>

         {/* Messages Container */}
         <div className="relative z-10 p-4 space-y-2 pb-6 min-h-full flex flex-col justify-end">
            
            {/* Day Separator Example (Static for now) */}
            <div className="flex justify-center mb-4">
                <span className="bg-[#E1F3FB] text-[#111b21] text-xs font-medium px-3 py-1.5 rounded-lg shadow-sm">
                    Today
                </span>
            </div>

            {/* Chat Status Banner */}
            {closureRequestedBy && chatStatus === 'OPEN' && (
                <div className="flex justify-center mb-2 px-4">
                    <div className="bg-[#FFF4E5] border-l-4 border-orange-400 p-3 rounded shadow-sm max-w-sm w-full">
                        <p className="text-sm text-gray-800">
                           <span className="font-bold">System:</span> 
                           {closureRequestedBy === currentUserId 
                                ? " You requested to end this session. Waiting for confirmation." 
                                : " Other user requested to end session. Please confirm via menu."}
                        </p>
                    </div>
                </div>
            )}

            {messages.map((message) => {
              const isOwn = message.sender_id === currentUserId
              return (
                <div key={message.id} className={`flex w - full ${ isOwn ? "justify-end" : "justify-start" } mb - 1 group`}>
                    <div className={`
                        relative max - w - [85 %] sm: max - w - [65 %] px - 3 py - 1.5 rounded - lg shadow - sm text - [14.2px] leading - [19px] break-words
                        ${ isOwn ? "bg-[#D9FDD3] rounded-tr-none" : "bg-white rounded-tl-none" }
`}>
                        {/* Tail Pseudo-elements simulated with SVG or Border hacks could go here, but rounded corners are decent enough for now */}
                        {/* Pure CSS Tail Hack */}
                        {isOwn ? (
                            <span className="absolute -right-2 top-0 w-0 h-0 border-[8px] border-transparent border-t-[#D9FDD3] border-l-[#D9FDD3]" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}></span>
                        ) : (
                             <span className="absolute -left-2 top-0 w-0 h-0 border-[8px] border-transparent border-t-white border-r-white" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }}></span>
                        )}

                        <div className="text-[#111b21] pr-16 pb-1">
                            {message.content}
                        </div>
                        
                        <div className="absolute bottom-1 right-2 flex items-center gap-1">
                            <span className="text-[10px] text-gray-500 min-w-fit">
                                {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </span>
                            {isOwn && (
                                <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" /> {/* Blue ticks for read (fake for now) */}
                            )}
                        </div>
                    </div>
                </div>
              )
            })}
            
            {chatStatus === 'CLOSED' && (
                <div className="flex justify-center my-6">
                    <div className="bg-[#FFF5F5] border border-red-100 text-red-600 px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm flex items-center gap-2">
                        <ShieldBan className="w-4 h-4" />
                        Session Closed
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
         </div>
      </div>

      {/* 3. INPUT AREA */}
      <div className="bg-[#F0F2F5] px-4 py-2 min-h-[62px] flex items-center gap-2 z-20 shrink-0">
         {chatStatus === 'OPEN' ? (
             <form onSubmit={handleSend} className="flex-1 flex items-center gap-2">
                 <button type="button" className="p-2 text-[#54656f] hover:bg-black/5 rounded-full transition">
                    {/* Emoji Icon placeholder */}
                    <svg viewBox="0 0 24 24" height="24" width="24" preserveAspectRatio="xMidYMid meet" className="" version="1.1" x="0px" y="0px" enableBackground="new 0 0 24 24"><path fill="currentColor" d="M12,21.7c5.3,0,9.7-4.3,9.7-9.7S17.3,2.3,12,2.3S2.3,6.6,2.3,12S6.6,21.7,12,21.7z M12,23.4  C5.7,23.4,0.6,18.3,0.6,12C0.6,5.7,5.7,0.6,12,0.6c6.3,0,11.4,5.1,11.4,11.4C23.4,18.3,18.3,23.4,12,23.4z"></path><path fill="currentColor" d="M11.5,10.6c0-0.9,0.7-1.7,1.7-1.7s1.7,0.7,1.7,1.7s-0.7,1.7-1.7,1.7S11.5,11.5,11.5,10.6z M7.7,12.3  c0.9,0,1.7-0.7,1.7-1.7s-0.7-1.7-1.7-1.7S6,9.6,6,10.6S6.7,12.3,7.7,12.3z M17.2,14.6c-0.6,2.5-2.8,4.2-5.2,4.2s-4.6-1.7-5.2-4.2  H17.2z"></path></svg>
                 </button>
                 
                 <div className="flex-1 relative">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message"
                        className="w-full py-2.5 px-4 rounded-lg bg-white border-none focus:ring-0 text-[#111b21] placeholder-[#54656f] text-[15px] shadow-sm"
                        disabled={!!closureRequestedBy && closureRequestedBy !== currentUserId} // Disable only if other person requested closure and I need to respond (actually, I shouldn't be disabled? I should be able to chat until I confirm. Logic check: usually you can still chat. I will enable chat.)
                    />
                 </div>

                 {newMessage.trim() ? (
                    <button type="submit" className="p-2.5 bg-[#008069] text-white rounded-full hover:bg-[#006e5a] shadow-md transition-all animate-in zoom-in duration-200">
                        <Send className="w-5 h-5 ml-0.5" />
                    </button>
                 ) : (
                    <button type="button" className="p-2.5 text-[#54656f] hover:bg-black/5 rounded-full transition">
                        {/* Mic Icon */}
                        <svg viewBox="0 0 24 24" height="24" width="24" className=""><path fill="currentColor" d="M11.999 14.942c2.001 0 3.531-1.53 3.531-3.531V4.35c0-2.001-1.53-3.531-3.531-3.531S8.469 2.35 8.469 4.35v7.061c0 2.001 1.53 3.531 3.53 3.531zm4.338-9.195h-1.428v5.66c0 1.605-1.298 2.902-2.91 2.902s-2.91-1.298-2.91-2.902V5.747H7.661v5.66c0 2.394 1.939 4.332 4.338 4.332s4.338-1.938 4.338-4.332V5.747zM11.999 16.942c-3.15 0-5.751-2.228-6.36-5.226H4.212c.636 3.996 4.106 6.963 8.356 6.963 4.25 0 7.72-2.967 8.356-6.963h-1.428c-.608 2.998-3.209 5.226-6.359 5.226zM11.934 19.463c-3.57 0-6.49-2.83-6.49-6.326H3.469c.677 4.136 4.28 7.29 8.53 7.29s7.853-3.154 8.53-7.29h-1.975c0 3.496-2.92 6.326-6.49 6.326zM11.306 20.34h1.389v2.859h-1.389z"></path></svg>
                    </button>
                 )}
             </form>
         ) : (
            <div className="w-full text-center py-2 text-[#54656f] text-sm uppercase tracking-wider font-medium">
                Messaging is disabled for this session
            </div>
         )}
      </div>
    </div>
  )
}
```
