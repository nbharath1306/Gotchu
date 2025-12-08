"use client";

import { useState } from "react";
import { Item } from "@/types";
import { ItemCard } from "./item-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Package, LogOut, Star, Shield, MapPin, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Footer } from "@/components/footer";

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
  { value: "all", label: "All Activity" },
  { value: "LOST", label: "Lost Items" },
  { value: "FOUND", label: "Found Items" },
  { value: "resolved", label: "Resolved" },
];

export function ProfileClient({ user, profile, items }: ProfileClientProps) {
  const [activeTab, setActiveTab] = useState("all");

  const filteredItems = items.filter((item) => {
    if (activeTab === "all") return true;
    if (activeTab === "resolved") return item.status === "RESOLVED";
    return item.type === activeTab && item.status !== "RESOLVED";
  });

  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      <div className="flex-1 pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          
          {/* Profile Header Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 mb-12 relative overflow-hidden border border-slate-100"
          >
            <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-teal-600 to-teal-800" />
            
            <div className="relative flex flex-col md:flex-row items-start md:items-end gap-8 pt-16">
              <div className="relative">
                <Avatar className="h-32 w-32 border-[6px] border-white shadow-2xl">
                  <AvatarImage src={user.picture || ""} alt={user.name || "User"} />
                  <AvatarFallback className="bg-slate-100 text-slate-600 text-3xl font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute bottom-2 right-2 bg-teal-500 text-white p-1.5 rounded-full border-4 border-white shadow-sm">
                  <Shield className="h-4 w-4" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0 pb-2">
                <h1 className="text-3xl font-bold text-slate-900 truncate tracking-tight mb-1">{user.name}</h1>
                <p className="text-slate-500 truncate mb-6 text-lg">{user.email}</p>
                
                <div className="flex flex-wrap gap-3">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-100 font-medium shadow-sm">
                    <Trophy className="h-4 w-4 fill-amber-500 text-amber-500" />
                    {profile?.karma || 0} Karma Points
                  </div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 text-slate-600 border border-slate-200 font-medium">
                    <Shield className="h-4 w-4" />
                    Verified Student
                  </div>
                </div>
              </div>

              <a href="/api/auth/logout" className="absolute top-6 right-6 md:static md:mb-2">
                <Button variant="outline" className="rounded-xl border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all shadow-sm">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </a>
            </div>
          </motion.div>

          {/* Content Tabs */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Your Activity</h2>
            <div className="flex bg-white p-1.5 rounded-xl shadow-sm border border-slate-200 overflow-x-auto max-w-full">
              {tabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap",
                    activeTab === tab.value
                      ? "bg-slate-100 text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Items Grid */}
          <AnimatePresence mode="popLayout">
            {filteredItems.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-24 bg-white rounded-[2rem] border border-dashed border-slate-200"
              >
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Package className="h-8 w-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">No activity yet</h3>
                <p className="text-slate-500">
                  Items you report or resolve will appear here.
                </p>
              </motion.div>
            ) : (
              <motion.div 
                layout
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {filteredItems.map((item) => (
                  <ItemCard key={item.id} item={item} />
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
