"use client";

import { useState } from "react";
import { Item } from "@/types";
import { ItemCard } from "./item-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { Footer } from "@/components/footer";
import { motion, AnimatePresence } from "framer-motion";

interface FeedClientProps {
  items: Item[];
}

const filters = [
  { value: "all", label: "All Items" },
  { value: "LOST", label: "Lost" },
  { value: "FOUND", label: "Found" },
];

export function FeedClient({ items: initialItems }: FeedClientProps) {
  const [items, setItems] = useState(initialItems);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = items.filter((item) => {
    const matchesFilter = activeFilter === "all" || item.type === activeFilter;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location_zone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch && item.status !== "RESOLVED";
  });

  return (
    <div className="min-h-screen bg-slate-50 bg-dot-pattern flex flex-col">
      <div className="flex-1 pt-24 pb-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Community Feed</h1>
              <p className="text-slate-500 max-w-xl">
                Real-time updates on lost and found items across campus.
              </p>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-slate-600 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              {filteredItems.length} active items
            </div>
          </div>

          {/* Controls */}
          <div className="sticky top-20 z-30 mb-8">
            <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by item, location, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-10 bg-slate-50 border-slate-200 focus:bg-white"
                />
              </div>
              <div className="flex bg-slate-100 p-1 rounded-lg shrink-0 overflow-x-auto">
                {filters.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setActiveFilter(filter.value)}
                    className={cn(
                      "px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200 whitespace-nowrap",
                      activeFilter === filter.value
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
                    )}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Items Grid */}
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredItems.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-1">No items found</h3>
              <p className="text-slate-500">Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
