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
  X,
  FileText,
  Download,
  Camera,
  Image as ImageIcon,
  File
} from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useUser } from "@auth0/nextjs-auth0/client"

// --- TYPES & CONSTANTS ---
interface Message {
  id: string
  content: string
  sender_id: string
  created_at: string
  message_type?: 'TEXT' | 'IMAGE' | 'FILE'
  media_url?: string
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
  const { user } = useUser()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [chatStatus, setChatStatus] = useState("OPEN")
  const [closureRequestedBy, setClosureRequestedBy] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)

  // UI State
  const [isActionsOpen, setIsActionsOpen] = useState(false)
  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false) // Lock for actions

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Refs for different inputs
  const imageInputRef = useRef<HTMLInputElement>(null)
  const mediaInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // --- UTILS ---
  const handleScroll = () => {
    if (!scrollContainerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
    setShowScrollButton(!isNearBottom)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    setShowScrollButton(false)
  }

  // --- EFFECTS ---
  // --- EFFECTS ---
  useEffect(() => {
    // Initial fetch & Polling
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/messages?chat_id=${chatId}`)

        // Handle Chat Deletion/Cleanup (Polling Check)
        if (res.status === 404 || res.status === 403) {
          // Chat is gone (Hard Deleted by other user)
          toast.error("Session ended by older user")
          router.push('/chat')
          return
        }

        if (res.ok) {
          const data = await res.json()
          if (data.messages) {
            setMessages(prev => {
              if (JSON.stringify(prev) !== JSON.stringify(data.messages)) {
                return data.messages
              }
              return prev
            })
          }
          if (data.chatStatus) setChatStatus(data.chatStatus)
          setClosureRequestedBy(data.closureRequestedBy || null)
        }
      } catch (err) { console.error("Sync error", err) }
      setIsLoading(false)
    }

    fetchMessages()
    const interval = setInterval(fetchMessages, 2000)
    return () => clearInterval(interval)
  }, [chatId])

  // Smart Scroll Effect
  useEffect(() => {
    if (isLoading || messages.length === 0) return

    const lastMsg = messages[messages.length - 1]
    const isMine = lastMsg.sender_id === currentUserId

    // 1. If I just sent a message, ALWAYS scroll to bottom
    if (isMine) {
      scrollToBottom()
      return
    }

    // 2. If I am already at the bottom (button hidden), keep me at the bottom
    if (!showScrollButton) {
      scrollToBottom()
    }
    // 3. Otherwise (scrolled up reading history), DO NOT scroll.
  }, [messages, isLoading, currentUserId]) // Removed showScrollButton dependency to avoid loops

  // --- HANDLERS ---
  const handleEndSessionPress = () => {
    setIsConfirmModalOpen(true)
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value)

    const target = e.target;
    target.style.height = 'auto';
    const newHeight = Math.min(target.scrollHeight, 160);
    target.style.height = `${newHeight}px`;
    target.style.overflowY = target.scrollHeight > 160 ? 'auto' : 'hidden';
  }

  const handleEndSession = async () => {
    if (isProcessing) return
    setIsProcessing(true)

    try {
      const res = await fetch("/api/chat/close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to process request")
      }

      if (data.status === 'PENDING_CLOSURE') {
        toast.info("Resolution requested. Waiting for confirmation.")
        setChatStatus('PENDING_CLOSURE')
        setClosureRequestedBy(currentUserId)
      } else if (data.status === 'DELETED' || data.status === 'CLOSED') {
        toast.success("Item Resolved! Chat history cleared.", { duration: 4000 })
        router.push('/chat')
      }

      setIsActionsOpen(false);
    } catch (e: any) {
      console.error(e)
      toast.error(e.message || "Failed to process request");
    } finally {
      setIsConfirmModalOpen(false)
      setIsProcessing(false)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Close menu immediately
    setIsAttachMenuOpen(false);

    // Determine Type
    const isImage = file.type.startsWith('image/')
    const msgType = isImage ? 'IMAGE' : 'FILE'

    // Optimistic UI
    const optimisticId = "opt-file-" + Math.random()
    const objectUrl = URL.createObjectURL(file)

    setMessages(prev => [...prev, {
      id: optimisticId,
      content: isImage ? 'Sending image...' : file.name,
      sender_id: currentUserId,
      created_at: new Date().toISOString(),
      message_type: msgType,
      media_url: objectUrl
    }])
    setTimeout(scrollToBottom, 50)
    setIsUploading(true)

    try {
      // 1. Upload
      const formData = new FormData()
      formData.append('file', file)

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!uploadRes.ok) {
        const err = await uploadRes.json()
        throw new Error(err.error || 'Upload failed')
      }

      const { url } = await uploadRes.json()

      // 2. Send Message
      const msgRes = await fetch("/api/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          content: isImage ? '' : file.name,
          message_type: msgType,
          media_url: url
        })
      })

      if (!msgRes.ok) throw new Error('Send failed')

    } catch (error: any) {
      toast.error(error.message || "Failed to send file")
      setMessages(prev => prev.filter(m => m.id !== optimisticId)) // Rollback optimistic
    } finally {
      setIsUploading(false)
      // Clear both inputs
      if (fileInputRef.current) fileInputRef.current.value = ''
      if (imageInputRef.current) imageInputRef.current.value = ''
      if (mediaInputRef.current) mediaInputRef.current.value = ''
    }
  }

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!newMessage.trim()) return

    const content = newMessage.trim()
    setNewMessage("")

    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    const optimisticId = "opt-" + Math.random()
    setMessages(prev => [...prev, {
      id: optimisticId,
      content: content,
      sender_id: currentUserId,
      created_at: new Date().toISOString(),
      message_type: 'TEXT'
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

  const renderMessageContent = (msg: Message, isOwn: boolean, isGrouped: boolean) => {
    if (msg.message_type === 'IMAGE') {
      return (
        <div className={`
                relative overflow-hidden rounded-2xl border border-gray-100 shadow-sm transition-all
                ${isOwn ? 'rounded-tr-sm bg-gray-900' : 'rounded-tl-sm bg-white'}
                ${isGrouped && isOwn ? 'rounded-tr-2xl' : ''}
                ${isGrouped && !isOwn ? 'rounded-tl-2xl' : ''}
            `}>
          <img
            src={msg.media_url || ''}
            alt="Sent image"
            className="block max-w-[280px] w-full h-auto object-cover rounded-lg"
          />
        </div>
      )
    }

    if (msg.message_type === 'FILE') {
      return (
        <div className={`
                relative p-3 rounded-2xl border shadow-sm transition-all flex items-center gap-3 w-[240px]
                ${isOwn
            ? 'bg-gray-900 text-white border-gray-800 rounded-tr-sm'
            : 'bg-white text-gray-900 border-gray-100 rounded-tl-sm'
          }
                ${isGrouped && isOwn ? 'rounded-tr-2xl mr-0' : ''}
                ${isGrouped && !isOwn ? 'rounded-tl-2xl ml-0' : ''}
            `}>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isOwn ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <FileText className={`w-5 h-5 ${isOwn ? 'text-gray-300' : 'text-gray-500'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{msg.content || 'Attachment'}</p>
            <p className={`text-[10px] ${isOwn ? 'text-gray-400' : 'text-gray-400'}`}>File</p>
          </div>
          <a
            href={msg.media_url}
            target="_blank"
            rel="noopener noreferrer"
            className={`shrink-0 p-1.5 rounded-md transition-colors ${isOwn ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-50 text-gray-400'}`}
          >
            <Download className="w-4 h-4" />
          </a>
        </div>
      )
    }

    // Default TEXT
    return (
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
        {isGrouped && (
          <div className={`
                    absolute top-1/2 -translate-y-1/2 opacity-0 group-hover/msg:opacity-100 transition-opacity text-[9px] text-gray-400 font-medium tabular-nums
                    ${isOwn ? '-left-12 text-right w-10' : '-right-12 text-left w-10'}
                `}>
            {format(new Date(msg.created_at), 'h:mm a')}
          </div>
        )}
      </div>
    )
  }



  // --- RENDER ---
  return (
    <div className="flex flex-col h-[100dvh] bg-[#FAFAFA] text-[#111111] font-sans overflow-hidden">

      {/* --- 1. COMMAND BAR --- */}
      <header className="h-[60px] bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-5 shrink-0 z-20 gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/chat" className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-900 transition-colors shrink-0">
            <ArrowLeft className="w-5 h-5 stroke-[1.5]" />
          </Link>
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-semibold tracking-tight shrink-0 ${otherUser.avatar_url ? 'bg-gray-100' : getRandomColor(otherUser.full_name || 'U')}`}>
              {otherUser.avatar_url ? <img src={otherUser.avatar_url} className="w-full h-full rounded-lg object-cover" alt="" /> : otherUser.full_name?.[0]}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold tracking-tight text-gray-900 truncate">{otherUser.full_name}</h2>
                {chatStatus === 'OPEN' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ring-2 ring-white shrink-0"></span>}
              </div>
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wide truncate">{itemTitle}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">

          {/* Resolve Action - Premium Upgraded Button */}
          {chatStatus !== 'CLOSED' && (
            <>
              {/* Desktop Button - Premium Pill */}
              <button
                onClick={handleEndSessionPress}
                className="hidden sm:flex items-center gap-2 pl-3 pr-4 py-1.5 bg-[#111111] hover:bg-black text-white rounded-full transition-all duration-300 shadow-lg shadow-emerald-500/10 border border-emerald-500/20 group hover:scale-[1.02]"
                title="End Conversation & Resolve Item"
              >
                <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                </div>
                <span className="hidden lg:inline text-xs font-semibold tracking-wide">{closureRequestedBy && closureRequestedBy !== currentUserId ? "Confirm & Close" : "Mark Resolved"}</span>
              </button>

              {/* Mobile Button - Floating Action Style */}
              <button
                onClick={handleEndSessionPress}
                className="sm:hidden w-8 h-8 flex items-center justify-center rounded-full bg-[#111111] hover:bg-black text-emerald-400 shadow-md border border-emerald-500/20"
              >
                <CheckCheck className="w-4 h-4" />
              </button>
            </>
          )}

          <div className="relative">
            <button onClick={() => setIsActionsOpen(!isActionsOpen)} className={`w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-500 transition-colors ${isActionsOpen ? 'bg-gray-100 text-gray-900' : ''}`}>
              <MoreHorizontal className="w-5 h-5 stroke-[1.5]" />
            </button>
            {isActionsOpen && (
              <div className="absolute right-0 top-10 w-56 bg-white border border-gray-100 shadow-xl shadow-gray-200/50 rounded-lg py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="px-3 py-2 border-b border-gray-50"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Chat Controls</p></div>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"><AlertCircle className="w-4 h-4 stroke-[1.5]" /> Report User</button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* --- STATUS BANNER (Premium) --- */}
      {chatStatus === 'PENDING_CLOSURE' && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50/50 border-b border-amber-100/50 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0 animate-in slide-in-from-top-2 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-400" />
          <div className="flex items-center gap-3 z-10">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 leading-none mb-1">
                {closureRequestedBy === currentUserId ? 'Waiting for confirmation' : 'Resolution Requested'}
              </h3>
              <p className="text-xs text-amber-700/80 font-medium">
                {closureRequestedBy === currentUserId
                  ? 'The other user must confirm to award Karma.'
                  : 'Please confirm if the item has been exchanged.'}
              </p>
            </div>
          </div>
          {closureRequestedBy !== currentUserId && (
            <button
              onClick={handleEndSessionPress}
              className="w-full sm:w-auto px-5 py-2 bg-white border border-amber-200 text-amber-700 hover:bg-amber-50 rounded-lg text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 z-10"
            >
              Review & Confirm
            </button>
          )}
        </div>
      )}

      {/* --- 2. THE STREAM --- */}
      <div
        className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 bg-[#FAFAFA] relative scroll-smooth"
        ref={scrollContainerRef}
        onScroll={handleScroll}
      >
        <div className="max-w-3xl mx-auto space-y-8 min-h-full">
          {!isLoading && messages.length === 0 && (
            <div className="text-center py-20 animate-in fade-in zoom-in duration-500">
              <div className="w-16 h-16 bg-white border border-gray-100 rounded-3xl mx-auto flex items-center justify-center mb-4 shadow-sm"><ShieldCheck className="w-8 h-8 text-indigo-500 stroke-[1.5]" /></div>
              <h3 className="text-gray-900 font-semibold mb-1">Secure Channel</h3>
              <p className="text-xs text-gray-400 font-medium">Messages are end-to-end encrypted.</p>
            </div>
          )}

          {isLoading ? (
            <div className="space-y-8 animate-pulse">
              <div className="flex gap-4"><div className="w-8 h-8 bg-gray-200 rounded-lg shrink-0" /><div className="space-y-2 max-w-[60%]"><div className="h-4 bg-gray-200 rounded w-24" /><div className="h-12 bg-gray-200 rounded-2xl w-full" /></div></div>
              <div className="flex gap-4 flex-row-reverse"><div className="w-8 h-8 bg-gray-200 rounded-lg shrink-0" /><div className="space-y-2 max-w-[60%] flex flex-col items-end"><div className="h-4 bg-gray-200 rounded w-16" /><div className="h-8 bg-gray-200 rounded-2xl w-48" /><div className="h-16 bg-gray-200 rounded-2xl w-64" /></div></div>
            </div>
          ) : (
            <div className="space-y-1">
              {messages.map((msg, i) => {
                const isOwn = msg.sender_id === currentUserId
                const prevMsg = messages[i - 1]
                const isSameSender = prevMsg && prevMsg.sender_id === msg.sender_id
                const timeDiff = prevMsg ? new Date(msg.created_at).getTime() - new Date(prevMsg.created_at).getTime() : 0
                const isGrouped = isSameSender && timeDiff < 5 * 60 * 1000
                const showDateSeparator = !prevMsg || new Date(msg.created_at).toDateString() !== new Date(prevMsg.created_at).toDateString()
                return (
                  <div key={msg.id} className="flex flex-col animate-in slide-in-from-bottom-2 fade-in duration-500 fill-mode-backwards" style={{ animationDelay: `${i * 0.05}s` }}>
                    {showDateSeparator && <div className="flex items-center justify-center my-6"><span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full border border-gray-100">{format(new Date(msg.created_at), 'MMMM d, yyyy')}</span></div>}
                    <div className={`flex gap-3 group/msg ${isOwn ? 'flex-row-reverse' : 'flex-row'} ${isGrouped ? 'mt-0.5' : 'mt-4'}`}>
                      <div className="shrink-0 w-8 flex flex-col items-center">
                        {!isGrouped ? (
                          <div className="w-8 h-8 rounded-full overflow-hidden shadow-sm border border-gray-100 bg-white">
                            {/* Logic: If Own -> user.picture; If Other -> otherUser.avatar_url; Else -> Initials */}
                            {isOwn ? (
                              user?.picture ? (
                                <img src={user.picture} alt="Me" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-black text-white flex items-center justify-center text-[10px] font-bold">ME</div>
                              )
                            ) : (
                              otherUser.avatar_url ? (
                                <img src={otherUser.avatar_url} alt={otherUser.full_name} className="w-full h-full object-cover" />
                              ) : (
                                <div className={`w-full h-full flex items-center justify-center text-[10px] font-bold ${getRandomColor(otherUser.full_name || 'U')}`}>
                                  {otherUser.full_name?.[0]}
                                </div>
                              )
                            )}
                          </div>
                        ) : (
                          <div className="w-8 h-full"></div>
                        )}
                      </div>
                      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[80%]`}>
                        {!isGrouped && <div className="flex items-center gap-2 mb-1 px-1"><span className="text-[11px] font-bold text-gray-900">{isOwn ? 'You' : otherUser.full_name}</span><span className="text-[10px] text-gray-400 tabular-nums">{format(new Date(msg.created_at), 'h:mm a')}</span></div>}
                        {renderMessageContent(msg, isOwn, isGrouped)}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      {/* --- SCROLL TO BOTTOM BUTTON --- */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-24 right-6 w-10 h-10 bg-white border border-gray-200 shadow-xl rounded-full flex items-center justify-center text-gray-600 hover:text-black hover:scale-110 transition-all z-30 animate-in fade-in zoom-in duration-200"
        >
          <CornerDownLeft className="w-5 h-5 stroke-[2] rotate-[-90deg]" />
        </button>
      )}

      {/* --- 3. COMPOSER --- */}
      {chatStatus === 'OPEN' ? (
        <div className="bg-white border-t border-gray-100 p-4 sm:px-8 sm:py-6 shrink-0 z-20 pb-safe">
          <div className="max-w-3xl mx-auto">

            {/* ATTACHMENT MENU (Animated Popover) */}
            {isAttachMenuOpen && (
              <div className="absolute bottom-20 left-4 sm:left-8 flex flex-col gap-2 min-w-[200px] animate-in fade-in slide-in-from-bottom-4 duration-200 shadow-2xl rounded-2xl border border-gray-100 bg-white p-1 z-50">

                {/* 1. Camera (Capture) */}
                <button
                  onClick={() => imageInputRef.current?.click()}
                  className="flex items-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 rounded-xl text-left transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                    <Camera className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Camera</p>
                    <p className="text-[10px] text-gray-400">Take a photo</p>
                  </div>
                </button>

                {/* 2. Gallery (Media Limit) */}
                <button
                  onClick={() => mediaInputRef.current?.click()}
                  className="flex items-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 rounded-xl text-left transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Photos & Videos</p>
                    <p className="text-[10px] text-gray-400">From Gallery</p>
                  </div>
                </button>

                {/* 3. Document (Files) */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 rounded-xl text-left transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Document</p>
                    <p className="text-[10px] text-gray-400">Send a file</p>
                  </div>
                </button>
              </div>
            )}

            <div className={`group flex gap-2 bg-white border rounded-xl p-2 transition-all duration-200 ${newMessage.trim() ? 'border-gray-300 shadow-sm' : 'border-gray-200 hover:border-gray-300'} focus-within:border-gray-400 focus-within:ring-4 focus-within:ring-gray-50`}>

              {/* Hidden Inputs */}
              {/* Camera Input: Forces Camera Launch */}
              <input type="file" ref={imageInputRef} className="hidden" accept="image/*" capture="environment" onChange={handleFileSelect} disabled={isUploading} />
              {/* Media Input: Gallery */}
              <input type="file" ref={mediaInputRef} className="hidden" accept="image/*,video/*" onChange={handleFileSelect} disabled={isUploading} />
              {/* File Input: General Picker */}
              <input type="file" ref={fileInputRef} className="hidden" accept="*" onChange={handleFileSelect} disabled={isUploading} />

              {/* Attach Trigger */}
              <button
                onClick={() => setIsAttachMenuOpen(!isAttachMenuOpen)}
                disabled={isUploading}
                className={`p-2 rounded-lg transition-colors ${isUploading ? 'text-gray-300' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'} ${isAttachMenuOpen ? 'bg-gray-100 text-gray-900' : ''}`}
              >
                {isAttachMenuOpen ? <X className="w-5 h-5 stroke-[1.5]" /> : <Paperclip className="w-5 h-5 stroke-[1.5]" />}
              </button>

              <textarea ref={textareaRef} value={newMessage} onChange={handleInput} onKeyDown={handleKeyDown} onFocus={() => setIsAttachMenuOpen(false)} placeholder="Type request or message..." className="flex-1 bg-transparent border-none resize-none px-2 py-2 text-[14px] leading-relaxed placeholder-gray-400 focus:ring-0" style={{ minHeight: '44px', maxHeight: '160px' }} rows={1} />
              <button onClick={() => handleSend()} disabled={!newMessage.trim() || isUploading} className={`p-2 rounded-lg transition-all duration-200 flex items-center justify-center ${newMessage.trim() ? 'bg-gray-900 text-white shadow-sm hover:bg-black' : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}><CornerDownLeft className="w-4 h-4" /></button>
            </div>
            <div className="flex justify-between items-center mt-2 px-1"><div className="text-[10px] text-gray-400 font-medium tracking-tight"><span className="hidden sm:inline">Tip: </span><span className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-200 text-gray-500 font-mono text-[9px] mx-1">⌘ + Enter</span>to send</div></div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border-t border-gray-100 p-6 text-center"><p className="text-sm font-medium text-gray-500">This conversation has been archived.</p></div>
      )}

      {/* --- MODAL --- */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 ring-1 ring-black/5">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {closureRequestedBy && closureRequestedBy !== currentUserId ? "Confirm Resolution?" : "Mark as Resolved?"}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                {closureRequestedBy && closureRequestedBy !== currentUserId
                  ? "This will award +10 Karma points to the finder. This action cannot be undone."
                  : "Are you sure this item has been resolved? We will ask the other user to confirm."}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsConfirmModalOpen(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEndSession}
                  disabled={isProcessing}
                  className={`flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 ${isProcessing ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isProcessing ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
