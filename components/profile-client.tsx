"use client";

import { useState } from "react";
import { Item } from "@/types";
import { ItemCard } from "./item-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Package, Star, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileClientProps {
  user: {
    name?: string | null;
    email?: string | null;
    picture?: string | null;
  };
  profile: {
    karma?: number;
  } | null;
  items: Item[];
}

const tabs = [
  { value: "all", label: "All Items" },
  { value: "lost", label: "Lost" },
  { value: "found", label: "Found" },
  { value: "resolved", label: "Resolved" },
];

export function ProfileClient({ user, profile, items }: ProfileClientProps) {
  const [activeTab, setActiveTab] = useState("all");

  const filteredItems = items.filter((item) => {
    if (activeTab === "all") return true;
    return item.status === activeTab;
  });

  const stats = {
    total: items.length,
    lost: items.filter(i => i.type === "lost").length,
    found: items.filter(i => i.type === "found").length,
    resolved: items.filter(i => i.status === "resolved").length,
  };

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <div className="min-h-screen bg-[#09090b] pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-10">
          <Avatar className="h-20 w-20 border-2 border-zinc-800">
            <AvatarImage src={user.picture || ""} alt={user.name || "User"} />
            <AvatarFallback className="bg-zinc-800 text-white text-xl">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{user.name}</h1>
            <p className="text-zinc-500">{user.email}</p>
            
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-zinc-400">
                <Star className="h-4 w-4 text-amber-400" />
                <span className="text-sm font-medium">{profile?.karma || 0} karma</span>
              </div>
            </div>
          </div>

          <a href="/api/auth/logout">
            <Button variant="outline" size="sm" className="border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total", value: stats.total },
            { label: "Lost", value: stats.lost },
            { label: "Found", value: stats.found },
            { label: "Resolved", value: stats.resolved },
          ].map((stat) => (
            <div key={stat.label} className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/30">
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-zinc-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-zinc-800 pb-4">
          {tabs.map((tab) => (
            <Button
              key={tab.value}
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "px-4 transition-colors",
                activeTab === tab.value
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
              )}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Items */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-zinc-800 flex items-center justify-center">
              <Package className="h-6 w-6 text-zinc-500" />
            </div>
            <h3 className="text-lg font-medium text-white mb-1">No items yet</h3>
            <p className="text-zinc-500">Items you report will appear here</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <ItemCard key={item.id} item={item} showActions={false} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
