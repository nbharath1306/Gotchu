import { ContactButton } from "@/components/contact-button"
import { auth0 } from "@/lib/auth0"
import type { Item } from "@/types"
import Link from "next/link"
import { MapPin, Clock, ArrowLeft, Package, Sparkles, ShieldCheck } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { notFound } from "next/navigation"
import { AuroraBackground } from "@/components/ui/aurora-background"
import { TextReveal } from "@/components/ui/text-reveal"
import { MagneticButton } from "@/components/ui/magnetic-button"

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

import { createClient } from "@/lib/supabase-server"

// Removed fetchItem in favor of direct DB access


export default async function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id) notFound()

  const supabase = await createClient()
  const { data: item, error } = await supabase
    .from('items')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error("Error fetching item:", error)
  }

  if (!item) {
    return (
      <AuroraBackground className="min-h-screen">
        <div className="glass-panel p-12 rounded-3xl text-center space-y-6 max-w-md mx-auto relative z-10">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
            <Package className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-display font-medium text-white">Signal Lost</h1>
          <p className="text-white/40">This item signal has faded from the network.</p>
          <MagneticButton>
            <Link href="/feed" className="px-6 py-3 bg-white/10 hover:bg-white text-white hover:text-black rounded-full transition-all text-sm font-medium">Return to Feed</Link>
          </MagneticButton>
        </div>
      </AuroraBackground>
    )
  }

  const session = await auth0.getSession();
  const currentUserSub = session?.user?.sub;
  const isOwner = item.user_id === currentUserSub;

  return (
    <AuroraBackground className="min-h-screen">
      <nav className="absolute top-8 left-8 z-20">
        <Link
          href="/feed"
          className="flex items-center gap-3 text-white/50 hover:text-white transition-colors group"
        >
          <div className="p-3 rounded-full bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors backdrop-blur-md">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium tracking-widest uppercase opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
            Back to Feed
          </span>
        </Link>
      </nav>

      <div className="w-full max-w-5xl px-4 pt-24 pb-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">

          {/* LEFT: VISUALS */}
          <div className="space-y-6">
            <div className="relative group perspective-[1000px]">
              {/* Holographic Element */}
              <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-500/20 to-emerald-500/20 rounded-3xl blur-2xl opacity-40 group-hover:opacity-60 transition-opacity" />

              <div className="glass-panel p-2 rounded-3xl overflow-hidden relative transform transition-transform duration-700 group-hover:rotate-x-2 group-hover:rotate-y-2">
                {item.image_url ? (
                  <div className="aspect-square relative rounded-2xl overflow-hidden bg-black/20">
                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
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

            {/* Status Indicator */}
            <div className={`
              w-full py-4 rounded-2xl border backdrop-blur-md flex items-center justify-center gap-3
              ${item.status === 'RESOLVED'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.1)]'
                : item.type === 'LOST'
                  ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400 shadow-[0_0_30px_rgba(99,102,241,0.1)]'
                  : 'bg-teal-500/10 border-teal-500/20 text-teal-400 shadow-[0_0_30px_rgba(20,184,166,0.1)]'
              }
            `}>
              {item.status === 'RESOLVED' ? <ShieldCheck className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
              <span className="font-mono text-sm tracking-widest uppercase font-bold">
                {item.status === 'RESOLVED' ? 'CASE CLOSED' : item.type === 'LOST' ? 'ACTIVE SIGNAL: LOST' : 'ACTIVE SIGNAL: FOUND'}
              </span>
            </div>
          </div>

          {/* RIGHT: DATA */}
          <div className="space-y-10">
            <div>
              <div className="flex gap-3 mb-6">
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-white/40 uppercase tracking-wider backdrop-blur-md">
                  ID: {item.id.slice(0, 8)}
                </span>
                {isOwner && (
                  <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-xs font-mono text-purple-300 uppercase tracking-wider backdrop-blur-md">
                    OWNER ACCESS
                  </span>
                )}
              </div>

              <TextReveal
                text={item.title}
                className="text-5xl md:text-6xl font-display font-medium text-white tracking-tighter leading-[1.1] mb-6"
              />

              <div className="flex flex-wrap gap-3 mb-8">
                {[
                  { icon: MapPin, text: item.location_zone?.replace('_', ' ') },
                  { icon: Clock, text: formatDistanceToNow(new Date(item.created_at), { addSuffix: true }) },
                  { icon: Package, text: item.category }
                ].map((badge, i) => (
                  <div key={i} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm text-slate-300 transition-colors backdrop-blur-sm cursor-default">
                    <badge.icon className="w-3 h-3 text-white/60" />
                    {badge.text}
                  </div>
                ))}
              </div>

              <div className="glass-panel p-6 rounded-2xl border-l-2 border-l-white/20">
                <p className="text-lg text-slate-300 leading-relaxed font-light">
                  {item.description || "No neural description data available."}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-8 border-t border-white/10 space-y-4">
              {!currentUserSub ? (
                <MagneticButton>
                  <Link href="/api/auth/login" className="w-full block py-4 bg-white text-black text-center font-medium rounded-xl hover:bg-slate-200 transition-colors">
                    Log In to Establish Connection
                  </Link>
                </MagneticButton>
              ) : isOwner ? (
                <div className="space-y-4">
                  <MagneticButton className="w-full">
                    <Link
                      href={`/item/${id}/matches`}
                      className="w-full block py-4 bg-indigo-500/20 border border-indigo-500/50 text-indigo-300 text-center font-medium rounded-xl hover:bg-indigo-500/30 hover:text-white transition-all shadow-[0_0_20px_rgba(99,102,241,0.2)] hover:shadow-[0_0_40px_rgba(99,102,241,0.4)]"
                    >
                      Run Neural Match Scan
                    </Link>
                  </MagneticButton>
                </div>
              ) : (
                <div className="glass-panel p-1 rounded-2xl">
                  {/* Wrapping Contact Button logic if needed, or simply passing props. 
                       Assuming ContactButton styles might need a nudge, but let's see. 
                       If ContactButton has its own styles, we might wrap it. */}
                  <ContactButton itemId={id} />
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </AuroraBackground>
  )
}
