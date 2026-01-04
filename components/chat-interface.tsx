"use client"

import { useEffect, useState, useRef } from "react"
import { toast } from "sonner"
import { MatrixGrid } from "@/components/ui/matrix-grid"
import { HolographicCard } from "@/components/ui/holographic-card"
import { NeonBadge } from "@/components/ui/neon-badge"
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
  File,
  Lock
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
  "bg-rose-500/10 text-rose-500 border border-rose-500/20",
  "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20",
  "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
  "bg-amber-500/10 text-amber-500 border border-amber-500/20",
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
                relative overflow-hidden rounded-2xl border transition-all
                ${isOwn ? 'rounded-tr-sm border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.1)]' : 'rounded-tl-sm border-white/10 bg-white/5'}
                ${isGrouped && isOwn ? 'rounded-tr-2xl' : ''}
                ${isGrouped && !isOwn ? 'rounded-tl-2xl' : ''}
            `}>
          <div className="absolute inset-0 bg-white/5 backdrop-blur-sm z-10 pointer-events-none mix-blend-overlay" />
          <img
            src={msg.media_url || ''}
            alt="Sent image"
            className="block max-w-[280px] w-full h-auto object-cover rounded-lg relative z-0"
          />
        </div>
      )
    }

    if (msg.message_type === 'FILE') {
      return (
        <div className={`
                relative p-3 rounded-2xl border shadow-sm transition-all flex items-center gap-3 w-[240px] backdrop-blur-md
                ${isOwn
            ? 'bg-purple-900/20 text-white border-purple-500/20 rounded-tr-sm'
            : 'bg-white/5 text-white border-white/10 rounded-tl-sm'
          }
                ${isGrouped && isOwn ? 'rounded-tr-2xl mr-0' : ''}
                ${isGrouped && !isOwn ? 'rounded-tl-2xl ml-0' : ''}
            `}>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isOwn ? 'bg-purple-500/20' : 'bg-white/10'}`}>
            <FileText className={`w-5 h-5 ${isOwn ? 'text-purple-300' : 'text-white/60'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate text-white">{msg.content || 'Attachment'}</p>
            <p className={`text-[10px] ${isOwn ? 'text-purple-300/60' : 'text-white/40'}`}>File</p>
          </div>
          <a
            href={msg.media_url}
            target="_blank"
            rel="noopener noreferrer"
            className={`shrink-0 p-1.5 rounded-md transition-colors ${isOwn ? 'hover:bg-purple-500/20 text-purple-300' : 'hover:bg-white/10 text-white/40'}`}
          >
            <Download className="w-4 h-4" />
          </a>
        </div>
      )
    }

    // Default TEXT
    return (
      <div className={`
            relative px-4 py-2 text-[14px] leading-relaxed transition-all break-words whitespace-pre-wrap break-all backdrop-blur-md
            ${isOwn
          ? 'bg-purple-600/20 text-white border border-purple-500/20 rounded-2xl rounded-tr-sm shadow-[0_0_10px_rgba(147,51,234,0.1)]'
          : 'bg-white/5 text-white border border-white/10 rounded-2xl rounded-tl-sm'
        }
            ${isGrouped && isOwn ? 'rounded-tr-2xl mr-0' : ''}
            ${isGrouped && !isOwn ? 'rounded-tl-2xl ml-0' : ''}
        `}>
        {msg.content}
        {isGrouped && (
          <div className={`
                    absolute top-1/2 -translate-y-1/2 opacity-0 group-hover/msg:opacity-100 transition-opacity text-[9px] text-white/30 font-medium tabular-nums font-mono
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
    <div className="flex flex-col h-[100dvh] bg-black text-white font-sans overflow-hidden relative">
      <MatrixGrid />

      {/* Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 via-transparent to-black/80 pointer-events-none z-0" />

      {/* --- 1. COMMAND BAR --- */}
      <header className="h-[70px] bg-black/20 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-4 sm:px-6 shrink-0 z-20 gap-2 relative">
        <div className="flex items-center gap-4 min-w-0">
          <Link href="/chat" className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white/60 hover:text-white transition-all shrink-0">
            <ArrowLeft className="w-5 h-5 stroke-[1.5]" />
          </Link>
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold tracking-tight shrink-0 border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)] ${otherUser.avatar_url ? 'bg-black' : getRandomColor(otherUser.full_name || 'U')}`}>
              {otherUser.avatar_url ? <img src={otherUser.avatar_url} className="w-full h-full rounded-xl object-cover" alt="" /> : otherUser.full_name?.[0]}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-medium tracking-tight text-white truncate">{otherUser.full_name}</h2>
                {chatStatus === 'OPEN' && (
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                    <span className="text-[9px] font-mono text-emerald-500 uppercase tracking-widest hidden sm:inline-block">Secure Link</span>
                  </span>
                )}
              </div>
              <p className="text-[10px] uppercase font-bold text-white/40 tracking-widest truncate font-mono">{itemTitle}</p>
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
                className="hidden sm:flex items-center gap-2 pl-3 pr-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.1)] border border-emerald-500/20 group hover:border-emerald-500/40"
                title="End Conversation & Resolve Item"
              >
                <div className="w-5 h-5 rounded-md bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
                </div>
                <span className="hidden lg:inline text-[10px] font-bold tracking-wider uppercase">{closureRequestedBy && closureRequestedBy !== currentUserId ? "Confirm & Close" : "Mark Resolved"}</span>
              </button>

              {/* Mobile Button - Floating Action Style */}
              <button
                onClick={handleEndSessionPress}
                className="sm:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 backdrop-blur-md"
              >
                <CheckCheck className="w-5 h-5" />
              </button>
            </>
          )}

          <div className="relative">
            <button onClick={() => setIsActionsOpen(!isActionsOpen)} className={`w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-colors border border-transparent hover:border-white/10 ${isActionsOpen ? 'bg-white/10 text-white border-white/10' : ''}`}>
              <MoreHorizontal className="w-5 h-5 stroke-[1.5]" />
            </button>
            {isActionsOpen && (
              <div className="absolute right-0 top-12 w-56 bg-black/90 backdrop-blur-xl border border-white/10 shadow-2xl rounded-xl py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="px-4 py-3 border-b border-white/5"><p className="text-[9px] font-bold text-white/30 uppercase tracking-widest font-mono">Channel Controls</p></div>
                <button className="w-full text-left px-4 py-3 text-xs font-medium text-white/70 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-2"><AlertCircle className="w-4 h-4 stroke-[1.5]" /> Report User</button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* --- STATUS BANNER (Premium) --- */}
      {chatStatus === 'PENDING_CLOSURE' && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0 animate-in slide-in-from-top-2 relative overflow-hidden backdrop-blur-md z-10">
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-500 animate-pulse" />
          <div className="flex items-center gap-3 z-10">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 border border-amber-500/20">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-none mb-1 tracking-tight">
                {closureRequestedBy === currentUserId ? 'WAITING FOR CONFIRMATION' : 'RESOLUTION REQUESTED'}
              </h3>
              <p className="text-[10px] text-amber-200/60 font-mono tracking-wide uppercase">
                {closureRequestedBy === currentUserId
                  ? 'Other party must confirm via secure link.'
                  : 'Please confirm exchange to terminate session.'}
              </p>
            </div>
          </div>
          {closureRequestedBy !== currentUserId && (
            <button
              onClick={handleEndSessionPress}
              className="w-full sm:w-auto px-6 py-2 bg-amber-500 text-black hover:bg-amber-400 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all flex items-center justify-center gap-2 z-10"
            >
              Confirm Exchange
            </button>
          )}
        </div>
      )}

      {/* --- 2. THE STREAM --- */}
      <div
        className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 relative scroll-smooth z-10"
        ref={scrollContainerRef}
        onScroll={handleScroll}
      >
        <div className="max-w-3xl mx-auto space-y-8 min-h-full">
          {!isLoading && messages.length === 0 && (
            <div className="text-center py-20 animate-in fade-in zoom-in duration-500 opacity-50">
              <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-full mx-auto flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(255,255,255,0.05)]">
                <ShieldCheck className="w-10 h-10 text-emerald-500/50 stroke-[1]" />
              </div>
              <h3 className="text-white font-medium mb-1 tracking-tight">ENCRYPTED CHANNEL <span className="text-emerald-500 font-mono text-xs ml-2">Verified</span></h3>
              <p className="text-xs text-white/30 font-mono uppercase tracking-widest">End-to-end encryption algorithm active.</p>
            </div>
          )}

          {isLoading ? (
            <div className="space-y-8 animate-pulse opacity-30">
              <div className="flex gap-4"><div className="w-8 h-8 bg-white/10 rounded-lg shrink-0" /><div className="space-y-2 max-w-[60%]"><div className="h-4 bg-white/10 rounded w-24" /><div className="h-12 bg-white/10 rounded-2xl w-full" /></div></div>
              <div className="flex gap-4 flex-row-reverse"><div className="w-8 h-8 bg-white/10 rounded-lg shrink-0" /><div className="space-y-2 max-w-[60%] flex flex-col items-end"><div className="h-4 bg-white/10 rounded w-16" /><div className="h-8 bg-white/10 rounded-2xl w-48" /><div className="h-16 bg-white/10 rounded-2xl w-64" /></div></div>
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
                    {showDateSeparator && <div className="flex items-center justify-center my-8"><span className="text-[9px] font-bold font-mono text-white/20 uppercase tracking-[0.2em] bg-white/5 px-4 py-1.5 rounded-full border border-white/5">{format(new Date(msg.created_at), 'MMMM d, yyyy')}</span></div>}
                    <div className={`flex gap-3 group/msg ${isOwn ? 'flex-row-reverse' : 'flex-row'} ${isGrouped ? 'mt-0.5' : 'mt-4'}`}>
                      <div className="shrink-0 w-8 flex flex-col items-center">
                        {!isGrouped ? (
                          <div className="w-8 h-8 rounded-lg overflow-hidden shadow-lg border border-white/10 bg-black/50 backdrop-blur-sm">
                            {/* Logic: If Own -> user.picture; If Other -> otherUser.avatar_url; Else -> Initials */}
                            {isOwn ? (
                              user?.picture ? (
                                <img src={user.picture} alt="Me" className="w-full h-full object-cover opacity-80" />
                              ) : (
                                <div className="w-full h-full bg-white/10 text-white flex items-center justify-center text-[10px] font-bold">ME</div>
                              )
                            ) : (
                              otherUser.avatar_url ? (
                                <img src={otherUser.avatar_url} alt={otherUser.full_name} className="w-full h-full object-cover opacity-80" />
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
                        {!isGrouped && <div className="flex items-center gap-2 mb-1 px-1"><span className="text-[10px] font-bold text-white/60 tracking-wider uppercase">{isOwn ? 'You' : otherUser.full_name}</span><span className="text-[9px] text-white/20 font-mono">{format(new Date(msg.created_at), 'h:mm a')}</span></div>}
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
          className="absolute bottom-24 right-6 w-10 h-10 bg-purple-500 border border-purple-400/50 shadow-[0_0_20px_rgba(168,85,247,0.4)] rounded-full flex items-center justify-center text-white hover:scale-110 transition-all z-30 animate-in fade-in zoom-in duration-200"
        >
          <CornerDownLeft className="w-5 h-5 stroke-[2] rotate-[-90deg]" />
        </button>
      )}

      {/* --- 3. COMPOSER --- */}
      {chatStatus === 'OPEN' ? (
        <div className="bg-black/40 backdrop-blur-xl border-t border-white/10 p-4 sm:px-8 sm:py-6 shrink-0 z-20 pb-safe relative">
          <div className="absolute inset-0 bg-gradient-to-t from-purple-900/5 to-transparent pointer-events-none" />
          <div className="max-w-3xl mx-auto relative z-10">

            {/* ATTACHMENT MENU (Animated Popover) */}
            {isAttachMenuOpen && (
              <div className="absolute bottom-20 left-4 sm:left-8 flex flex-col gap-2 min-w-[200px] animate-in fade-in slide-in-from-bottom-4 duration-200 shadow-2xl shadow-black/50 rounded-2xl border border-white/10 bg-black/90 p-1 z-50 backdrop-blur-xl">

                {/* 1. Camera (Capture) */}
                <button
                  onClick={() => imageInputRef.current?.click()}
                  className="flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-left transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400 border border-rose-500/20 group-hover:bg-rose-500/30 transition-colors">
                    <Camera className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Visual Log</p>
                    <p className="text-[10px] text-white/40 font-mono uppercase tracking-wider">Take a photo</p>
                  </div>
                </button>

                {/* 2. Gallery (Media Limit) */}
                <button
                  onClick={() => mediaInputRef.current?.click()}
                  className="flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-left transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/20 group-hover:bg-indigo-500/30 transition-colors">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Media Archive</p>
                    <p className="text-[10px] text-white/40 font-mono uppercase tracking-wider">Upload from device</p>
                  </div>
                </button>

                {/* 3. Document (Files) */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-left transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500/30 transition-colors">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Data Packet</p>
                    <p className="text-[10px] text-white/40 font-mono uppercase tracking-wider">Transmit file</p>
                  </div>
                </button>
              </div>
            )}

            <div className={`group flex gap-2 bg-white/5 border rounded-xl p-2 transition-all duration-300 backdrop-blur-md ${newMessage.trim() ? 'border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.1)] bg-white/10' : 'border-white/10 hover:border-white/20 hover:bg-white/10'}`}>

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
                className={`p-2 rounded-lg transition-colors ${isUploading ? 'text-white/20' : 'text-white/40 hover:text-white hover:bg-white/10'} ${isAttachMenuOpen ? 'bg-white/10 text-white' : ''}`}
              >
                {isAttachMenuOpen ? <X className="w-5 h-5 stroke-[1.5]" /> : <Paperclip className="w-5 h-5 stroke-[1.5]" />}
              </button>

              <textarea ref={textareaRef} value={newMessage} onChange={handleInput} onKeyDown={handleKeyDown} onFocus={() => setIsAttachMenuOpen(false)} placeholder="Enter encrypted message..." className="flex-1 bg-transparent border-none resize-none px-2 py-2 text-[14px] leading-relaxed placeholder-white/20 text-white focus:ring-0 font-light" style={{ minHeight: '44px', maxHeight: '160px' }} rows={1} />
              <button onClick={() => handleSend()} disabled={!newMessage.trim() || isUploading} className={`p-2 rounded-lg transition-all duration-300 flex items-center justify-center ${newMessage.trim() ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.3)] hover:bg-purple-500 hover:scale-105' : 'bg-white/5 text-white/10 cursor-not-allowed'}`}><CornerDownLeft className="w-4 h-4" /></button>
            </div>
            <div className="flex justify-between items-center mt-2 px-1"><div className="text-[10px] text-white/30 font-medium tracking-tight flex items-center gap-1"><Lock className="w-3 h-3 text-emerald-500/50" /> End-to-end encrypted</div> <div className="text-[10px] text-white/20 font-mono"><span className="hidden sm:inline">CMD + ENTER to send</span></div></div>
          </div>
        </div>
      ) : (
        <div className="bg-white/5 border-t border-white/10 p-6 text-center backdrop-blur-xl z-20"><p className="text-sm font-medium text-white/40 font-mono uppercase tracking-widest">Connection Terminated</p></div>
      )}

      {/* --- MODAL --- */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative bg-black/90 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-white/10">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-emerald-500/5 pointer-events-none" />
            <div className="p-8 text-center relative z-10">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                <ShieldCheck className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-xl font-medium text-white mb-2 tracking-tight">
                {closureRequestedBy && closureRequestedBy !== currentUserId ? "CONFIRM RESOLUTION" : "MARK AS RESOLVED"}
              </h3>
              <p className="text-sm text-white/60 leading-relaxed mb-8 font-light">
                {closureRequestedBy && closureRequestedBy !== currentUserId
                  ? "This will verify the transaction and award +10 Reputation Points to the finder. Irreversible."
                  : "Initiate resolution protocol? The opposing party will be asked to verify."}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsConfirmModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs font-bold font-mono uppercase tracking-wider rounded-xl transition-colors border border-white/5 hover:border-white/20"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEndSession}
                  disabled={isProcessing}
                  className={`flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-mono uppercase tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 ${isProcessing ? 'opacity-70 cursor-not-allowed' : ''}`}
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
