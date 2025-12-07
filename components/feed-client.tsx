"use client";

import { useState } from "react";
import { Item } from "@/types";
import { ItemCard } from "./item-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Package, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { Footer } from "@/components/footer";

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
      <div className="flex-1 pt-24 pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-10 text-center sm:text-left">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Community Feed</h1>
            <p className="text-slate-500">Real-time updates on lost and found items across campus.</p>
          </div>

          {/* Controls */}
          <div className="sticky top-20 z-30 bg-slate-50/80 backdrop-blur-xl p-4 -mx-4 mb-8 rounded-2xl border border-slate-200/50 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by item, location, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-teal-500 rounded-xl"
                />
              </div>
              <div className="flex gap-2 p-1 bg-slate-200/50 rounded-xl">
                {filters.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setActiveFilter(filter.value)}
                    className={cn(
                      "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                      activeFilter === filter.value
                        ? "bg-white text-teal-700 shadow-sm"
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
          {filteredItems.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-1">No items found</h3>
              <p className="text-slate-500">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredItems.map((item) => (
                <ItemCard key={item.id} item={item} onResolve={handleResolve} />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
