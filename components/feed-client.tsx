"use client";

import { useState } from "react";
import { Item } from "@/types";
import { ItemCard } from "./item-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Package, Filter, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Footer } from "@/components/footer";
import { motion, AnimatePresence } from "framer-motion";

interface FeedClientProps {
  items: Item[];
}

const filters = [
  { value: "all", label: "All Items" },
  { value: "lost", label: "Lost" },
  { value: "found", label: "Found" },
];

export function FeedClient({ items: initialItems }: FeedClientProps) {
  const [items, setItems] = useState(initialItems);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = items.filter((item) => {
    const matchesFilter = activeFilter === "all" || item.type === activeFilter;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch && item.status !== "resolved";
  });

  const handleResolve = async (id: string) => {
    try {
      const response = await fetch(`/api/items/${id}/resolve`, { method: "POST" });
      if (response.ok) {
        setItems(items.map(item => 
          item.id === id ? { ...item, status: "resolved" as const } : item
        ));
      }
    } catch (error) {
      console.error("Failed to resolve item:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      <div className="flex-1 pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-3 tracking-tight">Community Feed</h1>
              <p className="text-lg text-slate-500 max-w-xl">
                Real-time updates on lost and found items across campus. 
                Help your peers recover what matters.
              </p>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-slate-500 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              {filteredItems.length} active items
            </div>
          </div>

          {/* Controls */}
          <div className="sticky top-24 z-30 mb-10">
            <div className="bg-white/80 backdrop-blur-xl p-2 rounded-2xl border border-white/20 shadow-xl shadow-slate-900/5 flex flex-col md:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by item, location, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 bg-slate-50/50 border-transparent focus:bg-white focus:border-teal-500/20 transition-all"
                />
              </div>
              <div className="flex bg-slate-100/50 p-1 rounded-xl shrink-0 overflow-x-auto">
                {filters.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setActiveFilter(filter.value)}
                    className={cn(
                      "px-6 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap",
                      activeFilter === filter.value
                        ? "bg-white text-teal-700 shadow-sm ring-1 ring-black/5"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                    )}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Items Grid */}
          <AnimatePresence mode="popLayout">
            {filteredItems.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-32 bg-white rounded-[2rem] border border-dashed border-slate-200"
              >
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-3">
                  <Package className="h-10 w-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No items found</h3>
                <p className="text-slate-500 max-w-sm mx-auto">
                  We couldn't find anything matching your search. Try adjusting your filters or check back later.
                </p>
              </motion.div>
            ) : (
              <motion.div 
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredItems.map((item) => (
                  <ItemCard key={item.id} item={item} onResolve={handleResolve} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <Footer />
    </div>
  );
}
