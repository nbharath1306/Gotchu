"use client";

import { useState } from "react";
import { Item } from "@/types";
import { ItemCard } from "./item-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Package, TrendingUp, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface FeedClientProps {
  items: Item[];
}

const filters = [
  { value: "all", label: "All Items" },
  { value: "lost", label: "Lost" },
  { value: "found", label: "Found" },
  { value: "resolved", label: "Resolved" },
];

export function FeedClient({ items }: FeedClientProps) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const filteredItems = items.filter((item) => {
    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "resolved" ? item.status === "resolved" : item.type === activeFilter && item.status !== "resolved");
    
    const matchesSearch =
      searchQuery === "" ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: items.length,
    open: items.filter(i => i.status === "open").length,
    resolved: items.filter(i => i.status === "resolved").length,
  };

  const handleResolve = async (id: string) => {
    setResolvingId(id);
    try {
      await fetch(`/api/items/${id}/resolve`, { method: "PATCH" });
      window.location.reload();
    } catch (error) {
      console.error("Error resolving item:", error);
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-black pt-20">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-violet-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-3xl" />
      </div>
      
      <div className="relative max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl font-bold text-white mb-4"
          >
            Lost & Found{" "}
            <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
              Feed
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-zinc-400 text-lg"
          >
            Browse all reported items from your campus community
          </motion.p>
        </div>

        {/* Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          {[
            { label: "Total Items", value: stats.total, icon: Package, color: "violet" },
            { label: "Active", value: stats.open, icon: TrendingUp, color: "amber" },
            { label: "Recovered", value: stats.resolved, icon: CheckCircle, color: "emerald" },
          ].map((stat) => (
            <div 
              key={stat.label}
              className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm"
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  stat.color === "violet" && "bg-violet-500/20 text-violet-400",
                  stat.color === "amber" && "bg-amber-500/20 text-amber-400",
                  stat.color === "emerald" && "bg-emerald-500/20 text-emerald-400"
                )}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-zinc-500">{stat.label}</div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Search & Filter */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 mb-8"
        >
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <Input
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 h-12 bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-500 rounded-xl focus:border-violet-500/50 focus:ring-violet-500/20"
            />
          </div>
          
          {/* Filter tabs */}
          <div className="flex gap-1 p-1 bg-zinc-900/50 border border-zinc-800 rounded-xl">
            {filters.map((filter) => (
              <Button
                key={filter.value}
                variant="ghost"
                size="sm"
                onClick={() => setActiveFilter(filter.value)}
                className={cn(
                  "px-4 h-10 rounded-lg font-medium transition-all",
                  activeFilter === filter.value
                    ? "bg-violet-600 text-white hover:bg-violet-600"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                )}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Items Grid */}
        {filteredItems.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-zinc-800/50 flex items-center justify-center">
              <Package className="w-8 h-8 text-zinc-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No items found</h3>
            <p className="text-zinc-500 max-w-sm mx-auto">
              {searchQuery 
                ? "Try adjusting your search terms" 
                : "No items have been reported yet. Be the first to report!"}
            </p>
          </motion.div>
        ) : (
          <motion.div 
            layout
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item) => (
                <ItemCard 
                  key={item.id} 
                  item={item} 
                  onResolve={handleResolve}
                  showActions={true}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
