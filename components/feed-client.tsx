"use client";

import { useState } from "react";
import { Item } from "@/types";
import { ItemCard } from "./item-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeedClientProps {
  items: Item[];
}

const categories = [
  "All",
  "Electronics",
  "Clothing",
  "Accessories",
  "Documents",
  "Keys",
  "Bags",
  "Other",
];

const statuses = [
  { value: "all", label: "All" },
  { value: "lost", label: "Lost" },
  { value: "found", label: "Found" },
];

export function FeedClient({ items: initialItems }: FeedClientProps) {
  const [items, setItems] = useState(initialItems);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("all");

  const handleResolve = async (id: string) => {
    try {
      const res = await fetch(`/api/items/${id}/resolve`, { method: "POST" });
      if (res.ok) {
        setItems(items.map(item => 
          item.id === id ? { ...item, status: "resolved" as const } : item
        ));
      }
    } catch (error) {
      console.error("Failed to resolve item:", error);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch = 
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase()) ||
      item.location.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "All" || item.category === category;
    const matchesStatus = status === "all" || item.status === status;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const activeItems = filteredItems.filter(i => i.status !== "resolved");
  const resolvedItems = filteredItems.filter(i => i.status === "resolved");

  return (
    <div className="min-h-screen bg-[#09090b] pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Browse Items</h1>
          <p className="text-zinc-400">Find lost items or see what others have found</p>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4 mb-8">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus:border-zinc-700"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex gap-2">
            {statuses.map((s) => (
              <Button
                key={s.value}
                variant="ghost"
                size="sm"
                onClick={() => setStatus(s.value)}
                className={cn(
                  "px-4 transition-colors",
                  status === s.value
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                )}
              >
                {s.label}
              </Button>
            ))}
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant="ghost"
                size="sm"
                onClick={() => setCategory(cat)}
                className={cn(
                  "h-8 px-3 text-xs transition-colors",
                  category === cat
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-500 hover:text-white hover:bg-zinc-800/50"
                )}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 mb-6 text-sm text-zinc-500">
          <span>{activeItems.length} active</span>
          <span>{resolvedItems.length} resolved</span>
        </div>

        {/* Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-zinc-800 flex items-center justify-center">
              <Package className="h-6 w-6 text-zinc-500" />
            </div>
            <h3 className="text-lg font-medium text-white mb-1">No items found</h3>
            <p className="text-zinc-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onResolve={handleResolve}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
