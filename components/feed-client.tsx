"use client"

import { ItemCard } from "@/components/item-card"
import { SearchFilter } from "@/components/search-filter"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Package, AlertCircle, CheckCircle2 } from "lucide-react"

interface Item {
  id: string
  type: 'LOST' | 'FOUND'
  title: string
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

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter
      const matchesLocation = locationFilter === "all" || item.location_zone === locationFilter
      const matchesStatus = statusFilter === "all" || item.status === statusFilter
      return matchesSearch && matchesCategory && matchesLocation && matchesStatus
    })
  }, [items, searchQuery, categoryFilter, locationFilter, statusFilter])

  const lostItems = filteredItems.filter(item => item.type === 'LOST')
  const foundItems = filteredItems.filter(item => item.type === 'FOUND')

  // Stats
  const openItems = items.filter(item => item.status === 'OPEN').length
  const resolvedItems = items.filter(item => item.status === 'RESOLVED').length

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  }

  const itemAnimation = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  const EmptyState = ({ message }: { message: string }) => (
    <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
      <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
        <Package className="h-10 w-10 text-muted-foreground" />
      </div>
      <p className="text-muted-foreground">{message}</p>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass rounded-xl p-4 border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-violet-500/20 flex items-center justify-center">
              <Package className="h-5 w-5 text-violet-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{items.length}</p>
              <p className="text-xs text-muted-foreground">Total Items</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-4 border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{openItems}</p>
              <p className="text-xs text-muted-foreground">Open</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-4 border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{resolvedItems}</p>
              <p className="text-xs text-muted-foreground">Resolved</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <SearchFilter
        onSearch={setSearchQuery}
        onCategoryChange={setCategoryFilter}
        onLocationChange={setLocationFilter}
        onStatusChange={setStatusFilter}
      />

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6 glass border-white/10 p-1 rounded-xl">
          <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-violet-600 data-[state=active]:text-white">
            All ({filteredItems.length})
          </TabsTrigger>
          <TabsTrigger value="lost" className="rounded-lg data-[state=active]:bg-red-500 data-[state=active]:text-white">
            Lost ({lostItems.length})
          </TabsTrigger>
          <TabsTrigger value="found" className="rounded-lg data-[state=active]:bg-green-500 data-[state=active]:text-white">
            Found ({foundItems.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <motion.div key={item.id} variants={itemAnimation}>
                  <ItemCard item={item} currentUserId={currentUserId} />
                </motion.div>
              ))
            ) : (
              <EmptyState message="No items found matching your search." />
            )}
          </motion.div>
        </TabsContent>

        <TabsContent value="lost">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {lostItems.length > 0 ? (
              lostItems.map((item) => (
                <motion.div key={item.id} variants={itemAnimation}>
                  <ItemCard item={item} currentUserId={currentUserId} />
                </motion.div>
              ))
            ) : (
              <EmptyState message="No lost items reported." />
            )}
          </motion.div>
        </TabsContent>

        <TabsContent value="found">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {foundItems.length > 0 ? (
              foundItems.map((item) => (
                <motion.div key={item.id} variants={itemAnimation}>
                  <ItemCard item={item} currentUserId={currentUserId} />
                </motion.div>
              ))
            ) : (
              <EmptyState message="No found items reported." />
            )}
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
