"use client";

import { useState } from "react";
import { Item } from "@/types";
import { ItemCard } from "./item-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeedClientProps {
  items: Item[];
}

const filters = [
  { value: "all", label: "All" },
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

  const stats = {
    total: items.length,
    lost: items.filter(i => i.type === "lost" && i.status !== "resolved").length,
    found: items.filter(i => i.type === "found" && i.status !== "resolved").length,
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Item Feed</h1>
          <p className="text-gray-500">Browse lost and found items on campus</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Items", value: stats.total },
            { label: "Lost", value: stats.lost, color: "text-red-600" },
            { label: "Found", value: stats.found, color: "text-green-600" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl p-4 border border-gray-200">
              <div className={cn("text-2xl font-bold", stat.color || "text-gray-900")}>
                {stat.value}
              </div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-12 bg-white border-gray-200 rounded-full"
            />
          </div>
          <div className="flex gap-2">
            {filters.map((filter) => (
              <Button
                key={filter.value}
                variant={activeFilter === filter.value ? "default" : "outline"}
                onClick={() => setActiveFilter(filter.value)}
                className={cn(
                  "rounded-full px-6",
                  activeFilter === filter.value
                    ? "bg-gray-900 text-white hover:bg-gray-800"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                )}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Package className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <ItemCard key={item.id} item={item} onResolve={handleResolve} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
