"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
// import { ContactButton } from "@/components/contact-button" // Deprecated for inline logic
import type { Item } from "@/types"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { MapPin, Clock, ArrowLeft, Trash2, CheckCircle, Package } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useUser } from "@auth0/nextjs-auth0/client"
import { deleteItem, startChat } from "@/app/actions"
import { toast } from "sonner"
import { ItemSelectorModal } from "@/components/item-selector-modal"
import { AuroraBackground } from "@/components/ui/aurora-background"

const categoryEmojis: Record<string, string> = {
  Electronics: "📱",
  ID: "🪪",
  Keys: "🔑",
  Wallet: "👛",
  Bag: "🎒",
  Clothing: "👕",
  Accessories: "⌚",
  Books: "📚",
  Other: "📦",
}

export default function ItemPageClient() {
  const { user } = useUser()
  const params = useSearchParams()
  const router = useRouter()
  const id = params?.get("id")
  const [item, setItem] = useState<Item | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  // Actions
  const [isDeleting, setIsDeleting] = useState(false)
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false)

  // Claiming
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false)
  const [claimType, setClaimType] = useState<'LOST' | 'FOUND'>('LOST') // The type of item *I* have to offer

  const handleDelete = () => {
    setIsRevokeModalOpen(true)
  }

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      if (!id) return;
      const res = await deleteItem(id);
      if (res.error) {
        toast.error(res.error);
        setIsDeleting(false);
      } else {
        toast.success("Item deleted successfully");
        router.push("/feed");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
      console.error(err);
      setIsDeleting(false);
    }
  }

  const handleClaimStart = () => {
    if (!user) {
      router.push("/api/auth/login")
      return
    }
    // Logic: 
    // If I am viewing a FOUND item, I want to say "This is mine" -> So I must select my LOST item.
    // If I am viewing a LOST item, I want to say "I found this" -> So I must select my FOUND item.

    const requiredMyItemType = item?.type === 'FOUND' ? 'LOST' : 'FOUND';
    setClaimType(requiredMyItemType);
    setIsClaimModalOpen(true);
  }

  const handleItemSelect = async (myItemId: string) => {
    if (!id) return
    setIsClaimModalOpen(false)
    toast.info("Initiating secure channel...")

    try {
      const res = await startChat(id, myItemId)
      if (res.error) {
        toast.error(res.error)
      } else if (res.chatId) {
        toast.success("Connection established!")
        router.push(`/chat/${res.chatId}`)
      }
    } catch (e) {
      toast.error("Failed to connect")
    }
  }

  useEffect(() => {
    if (!id) {
      setError("No item ID provided in URL.")
      setLoading(false)
      return
    }
    fetch(`/api/item?id=${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error)
        } else {
          setItem(data.item)
        }
      })
      .catch(() => {
        setError("Failed to fetch item.")
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <AuroraBackground className="min-h-screen">
      <div className="flex items-center justify-center h-full relative z-10">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
          <p className="text-white/50 font-mono text-sm tracking-widest animate-pulse">ACQUIRING SIGNAL...</p>
        </div>
      </div>
    </AuroraBackground>
  )

  if (error) return (
    <AuroraBackground className="min-h-screen">
      <div className="flex items-center justify-center h-full relative z-10">
        <div className="text-center bg-black/50 p-8 rounded-3xl backdrop-blur-md border border-white/10 max-w-md mx-4">
          <h1 className="text-2xl font-display text-white mb-2">Signal Lost</h1>
          <p className="text-red-400 mb-6 font-mono text-sm">{error}</p>
          <Link
            href="/feed"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full font-bold tracking-wide hover:scale-105 transition-transform"
          >
            <ArrowLeft className="w-4 h-4" />
            RETURN TO FEED
          </Link>
        </div>
      </div>
    </AuroraBackground>
  )
  if (!item) return null

  // Check if I am the owner
  const isOwner = user && (user.sub === item.user_id)
  const isAdmin = user && (user.email === "n.bharath3430@gmail.com" || user.email === "amazingakhil2006@gmail.com")

  return (
    <AuroraBackground className="min-h-screen justify-start">
      <div className="w-full pt-20 pb-20 px-4 sm:px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <Link href="/feed" className="inline-flex items-center gap-2 text-white/50 hover:text-white mb-8 transition-colors font-mono text-sm tracking-widest uppercase group">
            <div className="p-2 rounded-full bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </div>
            BACK TO FEED
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-white">

            {/* LEFT COLUMN: VISUALS */}
            <div className="space-y-6">
              <div className="relative group perspective-[1000px]">
                {/* Holographic Glow */}
                <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-500/20 to-emerald-500/20 rounded-3xl blur-2xl opacity-40 group-hover:opacity-60 transition-opacity" />

                <div className="glass-panel p-2 rounded-3xl overflow-hidden relative transform transition-transform duration-700 group-hover:rotate-x-2 group-hover:rotate-y-2">
                  {item.image_url ? (
                    <div className="aspect-square relative rounded-2xl overflow-hidden bg-black/20">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      {/* Scanline Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-50 pointer-events-none mix-blend-overlay" />
                    </div>
                  ) : (
                    <div className="aspect-square bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                      <span className="text-9xl grayscale opacity-20 filter blur-sm group-hover:blur-0 transition-all duration-500">
                        {categoryEmojis[item.category] || "📦"}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Badge */}
              <div className={`
                w-full py-4 rounded-2xl border backdrop-blur-md flex items-center justify-center gap-3
                ${item.status === 'RESOLVED'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.1)]'
                  : item.type === 'LOST'
                    ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400 shadow-[0_0_30px_rgba(99,102,241,0.1)]'
                    : 'bg-teal-500/10 border-teal-500/20 text-teal-400 shadow-[0_0_30px_rgba(20,184,166,0.1)]'
                }
              `}>
                {item.status === 'RESOLVED' ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                <span className="font-mono text-sm tracking-widest uppercase font-bold">
                  {item.status === 'RESOLVED' ? 'CASE CLOSED' : item.type === 'LOST' ? 'ACTIVE SIGNAL: LOST' : 'ACTIVE SIGNAL: FOUND'}
                </span>
              </div>
            </div>

            {/* RIGHT COLUMN: DATA */}
            <div className="space-y-8">
              <div>
                <div className="flex gap-3 mb-6">
                  <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-mono text-white/40 uppercase tracking-wider backdrop-blur-md">
                    <MapPin className="w-3 h-3" />
                    {item.location_zone?.replace('_', ' ')}
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-mono text-white/40 uppercase tracking-wider backdrop-blur-md">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-mono text-white/40 uppercase tracking-wider backdrop-blur-md">
                    <Package className="w-3 h-3" />
                    {item.category}
                  </div>
                </div>

                <h1 className="text-5xl md:text-6xl font-display font-medium text-white tracking-tighter leading-[1.1] mb-6 drop-shadow-2xl">
                  {item.title}
                </h1>

                <div className="glass-panel p-6 rounded-2xl border-l-2 border-l-white/20">
                  <p className="text-lg text-slate-300 leading-relaxed font-light">
                    {item.description || "No neural description data available."}
                  </p>
                </div>
              </div>

              {/* Action Area */}
              {id && !isOwner && item.status !== 'RESOLVED' && (
                <div className="flex flex-col gap-6 pt-6 border-t border-white/10">
                  <button
                    onClick={handleClaimStart}
                    className={`w-full py-5 text-lg font-medium tracking-wide flex items-center justify-center gap-3 transition-all active:scale-95 rounded-xl shadow-2xl ${item.type === 'FOUND'
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_30px_rgba(16,185,129,0.3)]'
                      : 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-[0_0_30px_rgba(99,102,241,0.3)]'
                      }`}
                  >
                    {item.type === 'FOUND' ? <CheckCircle className="w-6 h-6" /> : <CheckCircle className="w-6 h-6" />}
                    {item.type === 'FOUND' ? "THIS IS MINE" : "I FOUND THIS"}
                  </button>
                  <p className="text-center text-xs text-white/30 font-mono uppercase tracking-widest">
                    {item.type === 'FOUND'
                      ? "Initiating recovery protocol..."
                      : "Initiating contact sequence..."}
                  </p>
                </div>
              )}

              {/* Owner Area */}
              {isOwner && (
                <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center backdrop-blur-md">
                  <p className="text-sm text-white/60 font-mono">This signal originates from your device.</p>
                </div>
              )}

              {/* Danger Zone */}
              {(isOwner || isAdmin) && (
                <div className="pt-8 mt-8 border-t border-white/10">
                  <h4 className="label-caps mb-4 text-red-500/70 flex items-center gap-2">
                    <Trash2 className="w-4 h-4" /> DANGER ZONE
                  </h4>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="w-full group relative overflow-hidden bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 transition-all duration-300 py-4 px-6 flex items-center justify-center gap-3 rounded-xl"
                  >
                    <span className={`font-mono text-xs font-bold tracking-widest z-10 transition-colors duration-300 ${isDeleting ? 'text-white' : 'text-red-400 group-hover:text-red-300'}`}>
                      {isDeleting ? "REVOKING SIGNAL..." : "REVOKE SIGNAL"}
                    </span>
                  </button>
                  <p className="text-[10px] text-white/30 mt-3 text-center font-mono uppercase tracking-wider">
                    Irreversible action. All data will be purged.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- REVOKE CONFIRMATION MODAL --- */}
      {isRevokeModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-display font-medium text-white mb-2">
                Revoke Signal?
              </h3>
              <p className="text-sm text-white/50 leading-relaxed mb-8">
                This will permanently delete the item and <strong>all associated chats</strong>. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsRevokeModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-xl transition-colors border border-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className={`flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl transition-colors shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 ${isDeleting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isDeleting ? 'Revoking...' : 'Revoke'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ItemSelectorModal
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        onSelect={handleItemSelect}
        filterType={claimType}
        userId={user?.sub || ''}
      />
    </AuroraBackground>
  )
}
