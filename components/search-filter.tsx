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
import { Search, SlidersHorizontal, X } from "lucide-react"
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
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for items..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 pr-10 bg-white/5 border-white/10 focus:border-violet-500/50 h-12 rounded-xl"
          />
          {searchQuery && (
            <button 
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
          className={`h-12 w-12 rounded-xl border-white/10 ${showFilters ? 'bg-violet-600 text-white border-violet-600' : 'bg-white/5'}`}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Filter Options */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 glass rounded-xl border-white/10">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</label>
                <Select onValueChange={onCategoryChange}>
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Electronics">Electronics</SelectItem>
                    <SelectItem value="ID">ID Cards</SelectItem>
                    <SelectItem value="Keys">Keys</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Location</label>
                <Select onValueChange={onLocationChange}>
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent>
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
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="OPEN">Open</SelectItem>
                    <SelectItem value="RESOLVED">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
