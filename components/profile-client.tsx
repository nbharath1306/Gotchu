"use client";

import { useState } from "react";
import { Item } from "@/types";
import { ItemCard } from "./item-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Package, LogOut } from "lucide-react";
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
  { value: "all", label: "All" },
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

  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <div className="min-h-screen bg-white pt-20 pb-16">
      <div className="max-w-2xl mx-auto px-6">
        {/* Profile Header */}
        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-neutral-100">
          <Avatar className="h-14 w-14">
            <AvatarImage src={user.picture || ""} alt={user.name || "User"} />
            <AvatarFallback className="bg-neutral-100 text-neutral-600">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-neutral-900 truncate">{user.name}</h1>
            <p className="text-sm text-neutral-500 truncate">{user.email}</p>
          </div>

          <a href="/api/auth/logout">
            <Button variant="ghost" size="sm" className="h-8 text-neutral-500 hover:text-neutral-900">
              <LogOut className="h-4 w-4" />
            </Button>
          </a>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6">
          {tabs.map((tab) => (
            <Button
              key={tab.value}
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "h-8 px-3 text-sm",
                activeTab === tab.value
                  ? "bg-neutral-100 text-neutral-900"
                  : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
              )}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Items */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 border border-neutral-200 rounded-lg">
            <Package className="h-8 w-8 text-neutral-300 mx-auto mb-3" />
            <p className="text-neutral-500 text-sm">No items yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <ItemCard key={item.id} item={item} showActions={false} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
