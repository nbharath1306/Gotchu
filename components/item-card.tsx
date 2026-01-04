"use client"

import { Item } from "@/types"
import { formatDistanceToNow } from "date-fns"
import { MapPin, Clock, ArrowUpRight } from "lucide-react"
import { HolographicCard } from "@/components/ui/holographic-card"
import { NeonBadge } from "@/components/ui/neon-badge"
import Link from "next/link"
import { motion } from "framer-motion"

interface ItemCardProps {
  item: Item
  index?: number
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

export function ItemCard({ item, index = 0 }: ItemCardProps) {
  const isLost = item.type === "LOST"
  const isResolved = item.status === "RESOLVED"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
    >
      <Link href={`/item?id=${item.id}`}>
        <HolographicCard className="h-full flex flex-col group">
          <div className="relative aspect-[4/3] overflow-hidden bg-white/5 border-b border-white/5">
            {item.image_url ? (
              <img src={item.image_url} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-6xl grayscale opacity-30 group-hover:opacity-60 group-hover:scale-110 transition-all duration-500 filter drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                  {categoryEmojis[item.category] || "📦"}
                </span>
              </div>
            )}

            {/* Status Badge */}
            <div className="absolute top-3 right-3 z-10">
              {isResolved ? (
                <NeonBadge variant="emerald" pulsing>RESOLVED</NeonBadge>
              ) : isLost ? (
                <NeonBadge variant="rose" pulsing>LOST</NeonBadge>
              ) : (
                <NeonBadge variant="amber" pulsing>FOUND</NeonBadge>
              )}
            </div>

            {/* Scanline Overlay on Hover */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
          </div>

          <div className="p-5 flex flex-col flex-1 relative">
            <div className="flex justify-between items-start mb-3 gap-4">
              <h3 className="font-display font-medium text-lg text-white leading-tight line-clamp-1 group-hover:text-purple-300 transition-colors">
                {item.title}
              </h3>
              <ArrowUpRight className="w-4 h-4 text-white/40 group-hover:text-purple-400 transition-colors flex-shrink-0" />
            </div>

            <div className="mt-auto space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono text-white/40 group-hover:text-white/60 transition-colors">
                <MapPin className="w-3 h-3" />
                <span className="truncate uppercase tracking-wider">{item.location_zone}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-white/40 group-hover:text-white/60 transition-colors">
                <Clock className="w-3 h-3" />
                <span>{formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}</span>
              </div>
            </div>
          </div>
        </HolographicCard>
      </Link>
    </motion.div>
  )
}
