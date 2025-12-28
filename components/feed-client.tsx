"use client"

import { useState } from "react"
import { Item } from "@/types"
import { ItemCard } from "./item-card"
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
    return matchesSearch && matchesType && matchesLocation
  })

  return (
    <div className="min-h-screen bg-[#F2F2F2]">
      <div className="pt-24 md:pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-4 tracking-tight text-[#111111]">
              LIVE FEED
            </h1>
            <p className="text-[#666666] max-w-2xl text-lg">
              Real-time database of reported items.
            </p>
          </motion.div>

          {/* Search & Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="sticky top-0 md:top-20 z-40 mb-12 bg-[#F2F2F2] py-4 border-b border-[#E5E5E5]"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#666666]" />
                <input
                  type="text"
                  placeholder="Search database..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-swiss !pl-12"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                {typeFilters.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setTypeFilter(filter.value)}
                    className={`flex items-center gap-2 px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider border transition-all whitespace-nowrap ${typeFilter === filter.value
                        ? "bg-black text-white border-black"
                        : "bg-white text-[#666666] border-[#E5E5E5] hover:border-black hover:text-black"
                      }`}
                  >
                    <filter.icon className="h-3 w-3" />
                    {filter.label}
                  </button>
                ))}

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-3 font-mono text-xs font-bold uppercase tracking-wider border transition-all ${showFilters
                      ? "bg-black text-white border-black"
                      : "bg-white text-[#666666] border-[#E5E5E5] hover:border-black hover:text-black"
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
                  className="overflow-hidden"
                >
                  <div className="pt-4">
                    <div className="flex flex-wrap gap-2">
                      {locationFilters.map((filter) => (
                        <button
                          key={filter.value}
                          onClick={() => setLocationFilter(filter.value)}
                          className={`px-4 py-2 text-[10px] font-mono uppercase tracking-widest border transition-all ${locationFilter === filter.value
                              ? "bg-black text-white border-black"
                              : "bg-white text-[#666666] border-[#E5E5E5] hover:border-black"
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
              className="text-center py-20 border border-dashed border-[#E5E5E5]"
            >
              <div className="w-16 h-16 bg-[#FFFFFF] rounded-full flex items-center justify-center mx-auto mb-6 border border-[#E5E5E5]">
                <Search className="h-6 w-6 text-[#666666]" />
              </div>
              <h3 className="text-lg font-bold text-[#111111] mb-2 font-display">NO SIGNALS DETECTED</h3>
              <p className="text-[#666666] font-mono text-sm">ADJUST SEARCH PARAMETERS</p>
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
