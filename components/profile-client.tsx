"use client";

import { useState } from "react";
import { Item } from "@/types";
import { ItemCard } from "./item-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Package, LogOut, Star, Shield, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
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
  { value: "lost", label: "Lost Items" },
  { value: "found", label: "Found Items" },
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
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      <div className="flex-1 pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          
          {/* Profile Header Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 mb-10 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-teal-600 to-teal-800" />
            
            <div className="relative flex flex-col sm:flex-row items-start sm:items-end gap-6 pt-12">
              <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                <AvatarImage src={user.picture || ""} alt={user.name || "User"} />
                <AvatarFallback className="bg-slate-100 text-slate-600 text-2xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0 pb-2">
                <h1 className="text-2xl font-bold text-slate-900 truncate">{user.name}</h1>
                <p className="text-slate-500 truncate mb-4">{user.email}</p>
                
                <div className="flex flex-wrap gap-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100 text-sm font-medium">
                    <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                    {profile?.karma || 0} Karma Points
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-sm font-medium">
                    <Shield className="h-4 w-4" />
                    Verified Student
                  </div>
                </div>
              </div>

              <a href="/api/auth/logout" className="absolute top-4 right-4 sm:static sm:mb-2">
                <Button variant="outline" size="sm" className="border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-rose-600 hover:border-rose-200 transition-colors">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </a>
            </div>
          </motion.div>

          {/* Content Tabs */}
          <div className="flex flex-wrap gap-2 mb-8 p-1 bg-slate-200/50 rounded-xl w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                  activeTab === tab.value
                    ? "bg-white text-teal-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Items Grid */}
          {filteredItems.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200"
            >
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-1">No items found</h3>
              <p className="text-slate-500">You haven't posted anything in this category yet.</p>
            </motion.div>
          ) : (
            <div className="grid gap-6">
              {filteredItems.map((item) => (
                <ItemCard key={item.id} item={item} showActions={false} />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
