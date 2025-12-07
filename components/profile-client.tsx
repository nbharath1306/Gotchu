"use client";

import { useState } from "react";
import { Item } from "@/types";
import { ItemCard } from "./item-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Package, Star, LogOut, TrendingUp, CheckCircle, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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

  const karma = profile?.karma || 0;

  return (
    <div className="min-h-screen bg-black pt-20">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-violet-600/10 rounded-full blur-3xl" />
      </div>
      
      <div className="relative max-w-5xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl bg-gradient-to-r from-violet-600/10 via-purple-600/10 to-pink-600/10 border border-white/5 backdrop-blur-sm p-8 mb-8"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar with glow */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full blur-xl opacity-50" />
              <Avatar className="relative h-24 w-24 border-4 border-black">
                <AvatarImage src={user.picture || ""} alt={user.name || "User"} />
                <AvatarFallback className="bg-gradient-to-r from-violet-600 to-purple-600 text-white text-2xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-1">{user.name}</h1>
              <p className="text-zinc-500 mb-4">{user.email}</p>
              
              {/* Karma badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                <span className="text-amber-400 font-semibold">{karma} Karma Points</span>
              </div>
            </div>

            <a href="/api/auth/logout">
              <Button 
                variant="outline" 
                className="border-zinc-700 text-zinc-400 hover:text-white hover:bg-white/5 hover:border-zinc-600 rounded-xl"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </a>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: "Total Items", value: stats.total, icon: Package, color: "violet" },
            { label: "Lost", value: stats.lost, icon: TrendingUp, color: "red" },
            { label: "Found", value: stats.found, icon: Award, color: "emerald" },
            { label: "Recovered", value: stats.resolved, icon: CheckCircle, color: "blue" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm"
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center mb-3",
                stat.color === "violet" && "bg-violet-500/20 text-violet-400",
                stat.color === "red" && "bg-red-500/20 text-red-400",
                stat.color === "emerald" && "bg-emerald-500/20 text-emerald-400",
                stat.color === "blue" && "bg-blue-500/20 text-blue-400"
              )}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-zinc-500">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Tabs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-1 p-1 mb-8 bg-zinc-900/50 border border-zinc-800 rounded-xl inline-flex"
        >
          {tabs.map((tab) => (
            <Button
              key={tab.value}
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "px-6 h-10 rounded-lg font-medium transition-all",
                activeTab === tab.value
                  ? "bg-violet-600 text-white hover:bg-violet-600"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              )}
            >
              {tab.label}
            </Button>
          ))}
        </motion.div>

        {/* Items */}
        {filteredItems.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-zinc-800/50 flex items-center justify-center">
              <Package className="w-8 h-8 text-zinc-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No items yet</h3>
            <p className="text-zinc-500">
              Items you report will appear here
            </p>
          </motion.div>
        ) : (
          <motion.div 
            layout
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filteredItems.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
              >
                <ItemCard item={item} showActions={false} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
