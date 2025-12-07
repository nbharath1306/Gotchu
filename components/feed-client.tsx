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

  return (
    <div className="min-h-screen bg-white pt-20 pb-16">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-neutral-900 mb-1">Feed</h1>
          <p className="text-neutral-500 text-sm">Browse lost and found items</p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-white border-neutral-200 text-sm"
            />
          </div>
          <div className="flex gap-1">
            {filters.map((filter) => (
              <Button
                key={filter.value}
                variant="ghost"
                size="sm"
                onClick={() => setActiveFilter(filter.value)}
                className={cn(
                  "h-9 px-3 text-sm",
                  activeFilter === filter.value
                    ? "bg-neutral-100 text-neutral-900"
                    : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
                )}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Items */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 border border-neutral-200 rounded-lg">
            <Package className="h-8 w-8 text-neutral-300 mx-auto mb-3" />
            <p className="text-neutral-500 text-sm">No items found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <ItemCard key={item.id} item={item} onResolve={handleResolve} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
