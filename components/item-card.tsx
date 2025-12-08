"use client"

import { Item } from "@/types"
import { formatDistanceToNow } from "date-fns"
import { MapPin, Clock, ArrowUpRight } from "lucide-react"
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
      transition={{ duration: 0.4, delay: index * 0.03, ease: "easeOut" }}
    >
      <Link href={`/chat/${item.id}`}>
        <div className="card-swiss p-0 overflow-hidden group cursor-pointer hover:scale-[1.02] transition-all duration-200">
          {item.image_url && (
            <div className="relative aspect-[4/3] overflow-hidden bg-[var(--bg-paper)]">
              <img src={item.image_url} alt={item.title} className="img-sharp w-full h-full" />
              <div className="absolute top-3 right-3">
                {isResolved ? (
                  <span className="pill-resolved">RESOLVED</span>
                ) : isLost ? (
                  <span className="pill-lost">LOST</span>
                ) : (
                  <span className="pill-found">FOUND</span>
                )}
              </div>
            </div>
          )}
          
          {!item.image_url && (
            <div className="aspect-[4/3] bg-[var(--bg-paper)] flex items-center justify-center relative border-b border-[var(--border-default)]">
              <span className="text-6xl grayscale opacity-50 group-hover:scale-110 transition-transform duration-300">
                {categoryEmojis[item.category] || "📦"}
              </span>
              <div className="absolute top-3 right-3">
                {isResolved ? (
                  <span className="pill-resolved">RESOLVED</span>
                ) : isLost ? (
                  <span className="pill-lost">LOST</span>
                ) : (
                  <span className="pill-found">FOUND</span>
                )}
              </div>
            </div>
          )}

          <div className="p-5">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-bold text-lg text-[var(--text-primary)] leading-tight line-clamp-1 group-hover:underline decoration-2 underline-offset-4">
                {item.title}
              </h3>
              <ArrowUpRight className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-secondary)]">
                <MapPin className="w-3 h-3" />
                <span className="truncate uppercase tracking-wide">{item.location}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-secondary)]">
                <Clock className="w-3 h-3" />
                <span>{formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
