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
    if (activeTab === "resolved") return item.status === "resolved";
    return item.type === activeTab && item.status !== "resolved";
  });

  const stats = {
    total: items.length,
    lost: items.filter(i => i.type === "lost").length,
    found: items.filter(i => i.type === "found").length,
    resolved: items.filter(i => i.status === "resolved").length,
  };

  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-6">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <Avatar className="h-20 w-20 border-2 border-gray-100">
              <AvatarImage src={user.picture || ""} alt={user.name || "User"} />
              <AvatarFallback className="bg-gray-100 text-gray-700 text-xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-500">{user.email}</p>
              
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Star className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-medium">{profile?.karma || 0} karma</span>
                </div>
              </div>
            </div>

            <a href="/api/auth/logout">
              <Button variant="outline" className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-full">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total", value: stats.total },
            { label: "Lost", value: stats.lost },
            { label: "Found", value: stats.found },
            { label: "Resolved", value: stats.resolved },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl p-4 border border-gray-200 text-center">
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <Button
              key={tab.value}
              variant={activeTab === tab.value ? "default" : "outline"}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "rounded-full px-6 shrink-0",
                activeTab === tab.value
                  ? "bg-gray-900 text-white hover:bg-gray-800"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              )}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Items */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Package className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No items yet</h3>
            <p className="text-gray-500">Items you report will appear here</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {filteredItems.map((item) => (
              <ItemCard key={item.id} item={item} showActions={false} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
