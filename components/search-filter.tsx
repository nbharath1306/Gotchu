"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, SlidersHorizontal, X, Sparkles } from "lucide-react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface SearchFilterProps {
  onSearch: (query: string) => void
  onCategoryChange: (category: string) => void
  onLocationChange: (location: string) => void
  onStatusChange: (status: string) => void
}

export function SearchFilter({ 
  onSearch, 
  onCategoryChange, 
  onLocationChange,
  onStatusChange 
}: SearchFilterProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isFocused, setIsFocused] = useState(false)

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    onSearch(value)
  }

  const clearSearch = () => {
    setSearchQuery("")
    onSearch("")
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-3">
        <motion.div 
          className={`relative flex-1 transition-all duration-300 ${isFocused ? 'scale-[1.02]' : ''}`}
        >
          {/* Glow Effect */}
          <div className={`absolute -inset-0.5 bg-gradient-to-r from-violet-500 to-pink-500 rounded-2xl blur opacity-0 transition-opacity duration-300 ${isFocused ? 'opacity-30' : ''}`} />
          
          <div className="relative">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-300 ${isFocused ? 'text-violet-400' : 'text-muted-foreground'}`} />
            <Input
              placeholder="Search for lost or found items..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="pl-12 pr-12 h-14 rounded-2xl bg-zinc-900/80 border-white/10 focus:border-violet-500/50 text-base backdrop-blur-xl"
            />
            {searchQuery && (
              <motion.button 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-white/10 flex items-center justify-center text-muted-foreground hover:text-white hover:bg-white/20 transition-all"
              >
                <X className="h-3 w-3" />
              </motion.button>
            )}
          </div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className={`h-14 w-14 rounded-2xl border-white/10 transition-all duration-300 ${
              showFilters 
                ? 'bg-gradient-to-r from-violet-500 to-pink-500 text-white border-transparent shadow-lg shadow-violet-500/25' 
                : 'bg-zinc-900/80 hover:bg-zinc-800'
            }`}
          >
            <SlidersHorizontal className="h-5 w-5" />
          </Button>
        </motion.div>
      </div>

      {/* Filter Options */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="p-6 rounded-3xl bg-zinc-900/80 backdrop-blur-xl border border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-4 w-4 text-violet-400" />
                <span className="text-sm font-semibold text-violet-400">Filters</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</label>
                  <Select onValueChange={onCategoryChange}>
                    <SelectTrigger className="h-12 rounded-xl bg-zinc-800/50 border-white/10 hover:border-violet-500/30 transition-colors">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl bg-zinc-900 border-white/10">
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Electronics">📱 Electronics</SelectItem>
                      <SelectItem value="ID">🪪 ID Cards</SelectItem>
                      <SelectItem value="Keys">🔑 Keys</SelectItem>
                      <SelectItem value="Other">📦 Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Location</label>
                  <Select onValueChange={onLocationChange}>
                    <SelectTrigger className="h-12 rounded-xl bg-zinc-800/50 border-white/10 hover:border-violet-500/30 transition-colors">
                      <SelectValue placeholder="All Locations" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl bg-zinc-900 border-white/10">
                      <SelectItem value="all">All Locations</SelectItem>
                      <SelectItem value="Innovation_Labs">Innovation Labs</SelectItem>
                      <SelectItem value="Canteen">Canteen</SelectItem>
                      <SelectItem value="Bus_Bay">Bus Bay</SelectItem>
                      <SelectItem value="Library">Library</SelectItem>
                      <SelectItem value="Hostels">Hostels</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</label>
                  <Select onValueChange={onStatusChange}>
                    <SelectTrigger className="h-12 rounded-xl bg-zinc-800/50 border-white/10 hover:border-violet-500/30 transition-colors">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl bg-zinc-900 border-white/10">
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="OPEN">🟢 Open</SelectItem>
                      <SelectItem value="RESOLVED">✅ Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
