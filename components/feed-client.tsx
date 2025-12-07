"use client"

import { ItemCard } from "@/components/item-card"
import { SearchFilter } from "@/components/search-filter"
import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Package, AlertCircle, CheckCircle2, TrendingUp, Sparkles } from "lucide-react"

interface Item {
  id: string
  type: 'LOST' | 'FOUND'
  title: string
  description?: string | null
  category: string
  location_zone: string
  status: 'OPEN' | 'RESOLVED'
  bounty_text?: string | null
  image_url?: string | null
  created_at: string
  user_id: string
}

interface FeedClientProps {
  items: Item[]
  currentUserId?: string
}

export function FeedClient({ items, currentUserId }: FeedClientProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [locationFilter, setLocationFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [activeTab, setActiveTab] = useState<"all" | "lost" | "found">("all")

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter
      const matchesLocation = locationFilter === "all" || item.location_zone === locationFilter
      const matchesStatus = statusFilter === "all" || item.status === statusFilter
      const matchesTab = activeTab === "all" || item.type.toLowerCase() === activeTab
      return matchesSearch && matchesCategory && matchesLocation && matchesStatus && matchesTab
    })
  }, [items, searchQuery, categoryFilter, locationFilter, statusFilter, activeTab])

  const lostCount = items.filter(item => item.type === 'LOST').length
  const foundCount = items.filter(item => item.type === 'FOUND').length
  const openItems = items.filter(item => item.status === 'OPEN').length
  const resolvedItems = items.filter(item => item.status === 'RESOLVED').length

  const stats = [
    { label: "Total Items", value: items.length, icon: Package, color: "violet" },
    { label: "Open", value: openItems, icon: AlertCircle, color: "amber" },
    { label: "Resolved", value: resolvedItems, icon: CheckCircle2, color: "green" },
    { label: "Success Rate", value: items.length > 0 ? `${Math.round((resolvedItems / items.length) * 100)}%` : "0%", icon: TrendingUp, color: "pink" },
  ]

  const tabs = [
    { id: "all" as const, label: "All Items", count: items.length },
    { id: "lost" as const, label: "Lost", count: lostCount, color: "red" },
    { id: "found" as const, label: "Found", count: foundCount, color: "green" },
  ]

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className="group relative rounded-2xl overflow-hidden"
          >
            <div className={`absolute inset-0 bg-gradient-to-br from-${stat.color}-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            <div className="relative p-5 rounded-2xl bg-zinc-900/80 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all">
              <stat.icon className={`h-6 w-6 text-${stat.color}-400 mb-3`} />
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search and Filters */}
      <SearchFilter
        onSearch={setSearchQuery}
        onCategoryChange={setCategoryFilter}
        onLocationChange={setLocationFilter}
        onStatusChange={setStatusFilter}
      />

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 rounded-2xl bg-zinc-900/80 backdrop-blur-xl border border-white/10">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`relative flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-300 ${
              activeTab === tab.id 
                ? "text-white" 
                : "text-muted-foreground hover:text-white"
            }`}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className={`absolute inset-0 rounded-xl ${
                  tab.id === "lost" 
                    ? "bg-gradient-to-r from-red-500 to-orange-500" 
                    : tab.id === "found" 
                      ? "bg-gradient-to-r from-green-500 to-emerald-500" 
                      : "bg-gradient-to-r from-violet-500 to-pink-500"
                } shadow-lg`}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10 flex items-center justify-center gap-2">
              {tab.label}
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.id 
                  ? "bg-white/20" 
                  : "bg-white/5"
              }`}>
                {tab.count}
              </span>
            </span>
          </motion.button>
        ))}
      </div>

      {/* Items Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab + searchQuery + categoryFilter}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ItemCard item={item} currentUserId={currentUserId} />
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="col-span-full"
            >
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <motion.div
                  animate={{ 
                    y: [0, -10, 0],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="h-24 w-24 rounded-3xl bg-gradient-to-br from-violet-500/20 to-pink-500/20 flex items-center justify-center mb-6 border border-white/10"
                >
                  <Sparkles className="h-12 w-12 text-violet-400" />
                </motion.div>
                <h3 className="text-xl font-bold mb-2">No items found</h3>
                <p className="text-muted-foreground max-w-md">
                  {searchQuery 
                    ? `No items matching "${searchQuery}". Try a different search term.`
                    : "No items have been reported yet. Be the first to report!"}
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
