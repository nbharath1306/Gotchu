import { createClient } from "@/lib/supabase-server"
import { auth0 } from "@/lib/auth0"
import { ContactButton } from "@/components/contact-button"
import { formatDistanceToNow } from "date-fns"
import { MapPin, Clock, ArrowLeft, Shield, Radio, Package } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

interface ItemPageProps {
  params: {
    id: string
  }
}

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

export default async function ItemPage({ params }: ItemPageProps) {
  const supabase = await createClient()
  const session = await auth0.getSession()
  const user = session?.user

  // Accept any non-empty string as a valid item ID
  if (!params.id || typeof params.id !== "string" || params.id.trim() === "") {
    return (
      <div className="min-h-screen bg-[#F2F2F2] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Invalid Item ID</h1>
          <p className="text-[#666666] mb-4">The item ID provided is not valid: "{params.id}"</p>
          <Link href="/feed" className="text-blue-600 hover:underline">
            Back to Feed
          </Link>
        </div>
      </div>
    )
  }

  const { data: itemData, error: itemError } = await supabase
    .from('items')
    .select('*')
    .eq('id', params.id)
    .single()

  if (itemError || !itemData) {
    console.error("Error fetching item:", itemError)
    return (
      <div className="min-h-screen bg-[#F2F2F2] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Item Not Found</h1>
          <p className="text-red-500 mb-4">{itemError?.message}</p>
          <Link href="/feed" className="text-blue-600 hover:underline">
            Back to Feed
          </Link>
        </div>
      </div>
    )
  }

  // Fetch user details separately to avoid join issues
  const { data: itemUser, error: userError } = await supabase
    .from('users')
    .select('full_name, avatar_url, karma_points')
    .eq('id', itemData.user_id)
    .single()
    
  // Combine data
  const item = {
    ...itemData,
    user: itemUser || { full_name: 'Unknown', avatar_url: null, karma_points: 0 }
  }

  const isOwner = user?.sub === item.user_id
  const isLost = item.type === "LOST"
  const isResolved = item.status === "RESOLVED"

  return (
    <div className="min-h-screen bg-[#F2F2F2] pt-24 pb-20 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <Link 
          href="/feed" 
          className="inline-flex items-center gap-2 text-[#666666] hover:text-black mb-8 transition-colors font-mono text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          BACK TO FEED
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Image */}
          <div className="space-y-6">
            <div className="card-swiss p-0 overflow-hidden">
              {item.image_url ? (
                <div className="aspect-square relative bg-white">
                  <img 
                    src={item.image_url} 
                    alt={item.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-square bg-white flex items-center justify-center border-b border-[#E5E5E5]">
                  <span className="text-9xl grayscale opacity-50">
                    {categoryEmojis[item.category] || "📦"}
                  </span>
                </div>
              )}
            </div>

            {/* Status Badge */}
            <div className={`p-4 border-2 text-center font-bold tracking-widest ${
              isResolved 
                ? "bg-green-100 border-green-500 text-green-700" 
                : isLost 
                  ? "bg-red-100 border-red-500 text-red-700" 
                  : "bg-blue-100 border-blue-500 text-blue-700"
            }`}>
              {isResolved ? "RESOLVED" : isLost ? "LOST ITEM" : "FOUND ITEM"}
            </div>
          </div>

          {/* Right Column: Details */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-display font-bold text-[#111111] mb-4 leading-tight">
                {item.title}
              </h1>
              
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2 px-3 py-1 bg-white border border-[#E5E5E5] rounded-full text-sm font-mono text-[#666666]">
                  <MapPin className="w-4 h-4" />
                  {item.location_zone.replace('_', ' ')}
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

              {item.bounty_text && (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-8">
                  <p className="text-yellow-800 font-bold text-sm uppercase tracking-wide mb-1">Reward</p>
                  <p className="text-yellow-900 font-medium">{item.bounty_text}</p>
                </div>
              )}
            </div>

            <div className="border-t border-[#E5E5E5] pt-8">
              <div className="flex items-center gap-4 mb-6">
                {item.user?.avatar_url ? (
                  <img 
                    src={item.user.avatar_url} 
                    alt={item.user.full_name} 
                    className="w-12 h-12 rounded-full border border-[#E5E5E5]"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#F2F2F2] border border-[#E5E5E5] flex items-center justify-center">
                    <span className="font-bold text-[#666666]">
                      {item.user?.full_name?.charAt(0) || "U"}
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-sm font-mono text-[#666666] uppercase">Reported by</p>
                  <p className="font-bold text-[#111111]">{item.user?.full_name || "Anonymous"}</p>
                </div>
              </div>

              {!isOwner && !isResolved && user && (
                <ContactButton itemId={item.id} />
              )}

              {!user && !isResolved && (
                <Link 
                  href="/auth/login" 
                  className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-lg"
                >
                  LOGIN TO CONTACT
                </Link>
              )}

              {isOwner && (
                <div className="bg-gray-100 p-4 text-center text-[#666666] font-mono text-sm">
                  This is your item report
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
