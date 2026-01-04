"use client"

import { useState } from "react"
import { Item } from "@/types"
import { ItemCard } from "./item-card"
import { MatrixGrid } from "@/components/ui/matrix-grid"
import { Search, Radio, Shield, Layers, SlidersHorizontal } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface FeedClientProps {
  items: Item[]
}

const typeFilters = [
  { value: "all", label: "ALL ITEMS", icon: Layers },
  { value: "LOST", label: "LOST", icon: Radio },
  { value: "FOUND", label: "FOUND", icon: Shield },
]

const locationFilters = [
  { value: "all", label: "ALL ZONES" },
  { value: "Innovation_Labs", label: "INNOVATION LABS" },
  { value: "Canteen", label: "CANTEEN" },
  { value: "Bus_Bay", label: "BUS BAY" },
  { value: "Library", label: "LIBRARY" },
  { value: "Hostels", label: "HOSTELS" },
]

export function FeedClient({ items }: FeedClientProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [locationFilter, setLocationFilter] = useState("all")
  const [showFilters, setShowFilters] = useState(false)

  const filteredItems = items.filter((item) => {
    // Exclude items with empty, null, or undefined IDs
    if (!item.id || typeof item.id !== "string" || item.id.trim() === "") return false;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === "all" || item.type === typeFilter
    const matchesLocation = locationFilter === "all" || item.location_zone === locationFilter
    const isActive = item.status === 'OPEN'
    return matchesSearch && matchesType && matchesLocation && isActive
  })

  return (
    <div className="min-h-screen bg-black relative">
      <MatrixGrid />
      <div className="pt-24 md:pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
              <span className="text-xs font-mono text-emerald-500/80 tracking-widest uppercase">Live Uplink Established</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-medium mb-4 tracking-tighter text-white">
              SIGNAL MATRIX
            </h1>
            <p className="text-white/40 max-w-xl text-lg font-light leading-relaxed">
              Real-time monitoring of lost assets and recovery protocols.
            </p>
          </motion.div>

          {/* Search & Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="sticky top-20 z-40 mb-12"
          >
            <div className="glass-panel p-2 rounded-2xl flex flex-col md:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <input
                  type="text"
                  placeholder="Scan frequency..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 px-4 pl-10 py-3 text-sm text-white placeholder-white/20 rounded-xl focus:outline-none focus:bg-white/10 transition-all font-mono"
                />
              </div>

              <div className="flex gap-1 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                {typeFilters.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setTypeFilter(filter.value)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-[10px] font-bold uppercase tracking-wider border transition-all whitespace-nowrap ${typeFilter === filter.value
                      ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                      : "bg-white/5 text-white/60 border-transparent hover:bg-white/10 hover:text-white"
                      }`}
                  >
                    <filter.icon className="h-3 w-3" />
                    {filter.label}
                  </button>
                ))}

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg font-mono text-[10px] font-bold uppercase tracking-wider border transition-all ${showFilters
                    ? "bg-white text-black border-white"
                    : "bg-white/5 text-white/60 border-transparent hover:bg-white/10"
                    }`}
                >
                  <SlidersHorizontal className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Expanded Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden bg-black/50 backdrop-blur-md border-x border-b border-white/10 rounded-b-2xl mx-1"
                >
                  <div className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {locationFilters.map((filter) => (
                        <button
                          key={filter.value}
                          onClick={() => setLocationFilter(filter.value)}
                          className={`px-3 py-1.5 rounded text-[10px] font-mono uppercase tracking-widest border transition-all ${locationFilter === filter.value
                            ? "bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.2)]"
                            : "bg-white/5 text-white/40 border-transparent hover:bg-white/10"
                            }`}
                        >
                          {filter.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Grid */}
          {filteredItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-32 border border-dashed border-white/10 rounded-3xl bg-white/5"
            >
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10 animate-pulse">
                <Search className="h-8 w-8 text-white/20" />
              </div>
              <h3 className="text-xl font-medium text-white mb-2 tracking-tight">NO SIGNALS DETECTED</h3>
              <p className="text-white/40 font-mono text-xs tracking-widest uppercase">Adjust scanners or broaden range</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item, index) => (
                <ItemCard key={item.id} item={item} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
