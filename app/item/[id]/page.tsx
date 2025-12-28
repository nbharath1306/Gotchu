import { ContactButton } from "@/components/contact-button"
import { auth0 } from "@/lib/auth0"
import type { Item } from "@/types"
import Link from "next/link"
import { MapPin, Clock, ArrowLeft, Package } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { notFound } from "next/navigation"

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

async function fetchItem(id: string): Promise<Item | null> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ""}/api/item?id=${id}`)
  if (!res.ok) return null
  const data = await res.json()
  if (data.error) return null
  return data.item as Item
}

export default async function ItemDetailPage({ params }: { params: { id: string } }) {
  const id = params.id
  if (!id) notFound()
  const item = await fetchItem(id)
  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Invalid Item ID</h1>
          <p className="text-red-500 mb-4">Item not found</p>
          <Link href="/feed" className="text-blue-600 hover:underline">Back to Feed</Link>
        </div>
      </div>
    )
  }

  // Debug owner check
  const session = await auth0.getSession();
  const currentUserSub = session?.user?.sub;

  if (currentUserSub) {
    console.log(`[ItemPage] Owner Check: Item.user_id (${item.user_id}) === User.sub (${currentUserSub}) ? ${item.user_id === currentUserSub}`);
  }

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

              {/* Action Buttons */}
              {id && currentUserSub && (
                item.user_id === currentUserSub ? (
                  <div className="flex flex-col gap-3">
                    <Link
                      href={`/item/${id}/matches`}
                      className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-lg text-center"
                    >
                      VIEW POTENTIAL MATCHES
                    </Link>
                    {/* Could add a 'Mark Resolved' button here too if we wanted */}
                  </div>
                ) : (
                  <ContactButton itemId={id} />
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
