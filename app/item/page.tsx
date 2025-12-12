"use client"

import { useEffect, useState } from "react"
import { ContactButton } from "@/components/contact-button"
import type { Item } from "@/types"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { MapPin, Clock, ArrowLeft, Shield, Radio, Package } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

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
  const params = useSearchParams()
  const router = useRouter()
  const id = params.get("id")
  const [item, setItem] = useState<Item | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) {
      setError("No item ID provided in URL.")
      setLoading(false)
      toast.error("No item ID provided in URL.")
      return
    }
    fetch(`/api/item?id=${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error)
          toast.error(data.error)
        } else {
          setItem(data.item)
        }
      })
      .catch(() => {
        setError("Failed to fetch item.")
        toast.error("Failed to fetch item.")
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
              {/* No bounty_text in Item type, so skip reward section */}
              {id && <ContactButton itemId={id} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
