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

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Invalid Item ID</h1>
        <p className="text-red-500 mb-4">{error}</p>
        <Link href="/feed" className="text-blue-600 hover:underline">Back to Feed</Link>
      </div>
    </div>
  )
  if (!item) return null

  // Check if I am the owner
  const isOwner = user && (user.sub === item.user_id)
  const isAdmin = user && (user.email === "n.bharath3430@gmail.com" || user.email === "amazingakhil2006@gmail.com")

  return (
    <div className="min-h-screen bg-[#F2F2F2] pt-24 pb-20 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/feed" className="inline-flex items-center gap-2 text-[#666666] hover:text-black mb-8 transition-colors font-mono text-sm">
          <ArrowLeft className="w-4 h-4" />
          BACK TO FEED
        </Link>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="card-swiss p-0 overflow-hidden">
              {item.image_url ? (
                <div className="aspect-square relative bg-white">
                  <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="aspect-square bg-white flex items-center justify-center border-b border-[#E5E5E5]">
                  <span className="text-9xl grayscale opacity-50">{categoryEmojis[item.category] || "📦"}</span>
                </div>
              )}
            </div>
            <div className={`p-4 border-2 text-center font-bold tracking-widest ${item.status === "RESOLVED" ? "bg-green-100 border-green-500 text-green-700" : item.type === "LOST" ? "bg-red-100 border-red-500 text-red-700" : "bg-blue-100 border-blue-500 text-blue-700"}`}>
              {item.status === "RESOLVED" ? "RESOLVED" : item.type === "LOST" ? "LOST ITEM" : "FOUND ITEM"}
            </div>
          </div>
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-display font-bold text-[#111111] mb-4 leading-tight">{item.title}</h1>
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2 px-3 py-1 bg-white border border-[#E5E5E5] rounded-full text-sm font-mono text-[#666666]">
                  <MapPin className="w-4 h-4" />
                  {item.location_zone?.replace('_', ' ')}
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-white border border-[#E5E5E5] rounded-full text-sm font-mono text-[#666666]">
                  <Clock className="w-4 h-4" />
                  {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-white border border-[#E5E5E5] rounded-full text-sm font-mono text-[#666666]">
                  <Package className="w-4 h-4" />
                  {item.category}
                </div>
              </div>
              <div className="prose prose-lg text-[#666666] mb-8">
                <p>{item.description || "No description provided."}</p>
              </div>

              {/* --- ACTION AREA --- */}
              {id && !isOwner && item.status !== 'RESOLVED' && (
                <div className="flex flex-col gap-6 mt-6">
                  <button
                    onClick={handleClaimStart}
                    className={`w-full py-4 text-lg font-bold tracking-wide flex items-center justify-center gap-3 transition-all hover:scale-[1.02] shadow-xl ${item.type === 'FOUND'
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-500/20'
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20'
                      }`}
                  >
                    {item.type === 'FOUND' ? (
                      <>
                        <CheckCircle className="w-6 h-6" />
                        THIS IS MINE
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-6 h-6" />
                        I FOUND THIS
                      </>
                    )}
                  </button>
                  <p className="text-center text-xs text-gray-400 font-mono">
                    {item.type === 'FOUND'
                      ? "You will be asked to link your 'Lost' report."
                      : "You will be asked to link your 'Found' report."}
                  </p>
                </div>
              )}

              {/* --- CHAT WITH YOURSELF WARNING --- */}
              {isOwner && (
                <div className="p-4 bg-gray-100 rounded-lg border border-gray-200 text-center">
                  <p className="text-sm text-gray-500 font-mono">This is your item.</p>
                </div>
              )}


              {/* Owner Controls OR Admin Override */}
              {(isOwner || isAdmin) && (
                <div className="pt-6 border-t border-[#E5E5E5] mt-6">
                  <h4 className="label-caps mb-3 text-red-600/70">DANGER ZONE</h4>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="w-full group relative overflow-hidden bg-white border border-red-200 hover:border-red-600 transition-all duration-300 py-4 px-6 flex items-center justify-center gap-3"
                  >
                    <div className={`absolute inset-0 bg-red-600 transform origin-left transition-transform duration-300 ${isDeleting ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
                    <Trash2 className={`w-4 h-4 z-10 transition-colors duration-300 ${isDeleting ? 'text-white' : 'text-red-500 group-hover:text-white'}`} />
                    <span className={`font-mono text-xs font-bold tracking-widest z-10 transition-colors duration-300 ${isDeleting ? 'text-white' : 'text-red-600 group-hover:text-white'}`}>
                      {isDeleting ? "REVOKING..." : "REVOKE ITEM"}
                    </span>
                  </button>
                  <p className="text-[10px] text-[#999999] mt-2 text-center font-mono">
                    This action cannot be undone. All chats will be deleted.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- REVOKE CONFIRMATION MODAL --- */}
      {isRevokeModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 ring-1 ring-black/5">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Revoke this Item?
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                This will permanently delete the item and <strong>all associated chats</strong>. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsRevokeModalOpen(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className={`flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 ${isDeleting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isDeleting ? 'Revoking...' : 'Yes, Revoke'}
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
    </div>
  )
}
