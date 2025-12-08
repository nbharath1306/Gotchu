"use client";

import { 
  Mail, 
  Trophy,
  TrendingUp,
  Package,
  CheckCircle2,
  Search,
  Eye,
  Clock,
  MapPin,
  ArrowRight,
  LogOut,
  Settings,
  Shield,
  Radio
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { format } from "date-fns";
import { Item } from "@/types";
import { ItemCard } from "@/components/item-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProfileUser {
  name?: string;
  email?: string;
  picture?: string;
}

interface ProfileData {
  karma: number;
}

interface ProfileClientProps {
  user: ProfileUser;
  profile: ProfileData | null;
  items: Item[];
}

export function ProfileClient({ user, profile, items }: ProfileClientProps) {
  const karma = profile?.karma || 0;
  const karmaLevel = Math.floor(karma / 100) + 1;
  const karmaProgress = karma % 100;

  const itemsReported = items.filter(i => i.type === "LOST").length;
  const itemsFound = items.filter(i => i.type === "FOUND").length;
  const itemsResolved = items.filter(i => i.status === "RESOLVED").length;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F2] pt-24 pb-20 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* User Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 card-swiss bg-white p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6"
          >
            <div className="relative">
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={user.name || "Profile"}
                  className="w-[100px] h-[100px] rounded-full border border-[#E5E5E5] object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-[#F2F2F2] flex items-center justify-center border border-[#E5E5E5]">
                  <span className="text-3xl font-bold text-[#666666]">{user.name?.charAt(0) || "U"}</span>
                </div>
              )}
              <div className="absolute -bottom-2 -right-2 bg-black text-white text-[10px] font-mono px-2 py-1 rounded-full border-2 border-white">
                LVL {karmaLevel}
              </div>
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl font-display font-bold text-[#111111] mb-1">{user.name}</h1>
              <div className="flex items-center gap-2 text-[#666666] font-mono text-sm mb-4">
                <Mail className="w-4 h-4" />
                {user.email}
              </div>
              
              {/* Karma Progress */}
              <div className="max-w-md">
                <div className="flex justify-between text-[10px] font-mono uppercase tracking-wider mb-1">
                  <span>Karma Points</span>
                  <span>{karmaProgress}/100 to Lvl {karmaLevel + 1}</span>
                </div>
                <div className="h-2 bg-[#F2F2F2] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#00C853]" 
                    style={{ width: `${karmaProgress}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 w-full sm:w-auto mt-4 sm:mt-0">
              <button className="btn-outline py-2 text-xs w-full sm:w-auto">
                EDIT PROFILE
              </button>
              <a href="/auth/logout" className="btn-primary py-2 text-xs w-full sm:w-auto text-center bg-red-600 hover:bg-red-700 border-red-600">
                SIGN OUT
              </a>
            </div>
          </motion.div>

          {/* Stats Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card-swiss bg-white p-8 flex flex-col justify-center"
          >
            <h3 className="label-caps mb-6">LIFETIME STATS</h3>
            <div className="grid grid-cols-2 gap-y-8 gap-x-4">
              <div>
                <div className="text-3xl font-bold text-[#111111] mb-1">{itemsReported}</div>
                <div className="text-xs font-mono text-[#666666] flex items-center gap-1">
                  <Radio className="w-3 h-3" /> LOST
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#111111] mb-1">{itemsFound}</div>
                <div className="text-xs font-mono text-[#666666] flex items-center gap-1">
                  <Shield className="w-3 h-3" /> FOUND
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#111111] mb-1">{itemsResolved}</div>
                <div className="text-xs font-mono text-[#666666] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> RESOLVED
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#111111] mb-1">{karma}</div>
                <div className="text-xs font-mono text-[#666666] flex items-center gap-1">
                  <Trophy className="w-3 h-3" /> KARMA
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display font-bold text-[#111111]">ACTIVITY HISTORY</h2>
            <TabsList className="bg-white border border-[#E5E5E5] p-1 h-auto hidden sm:inline-flex">
              <TabsTrigger value="all" className="text-xs font-mono data-[state=active]:bg-[#111111] data-[state=active]:text-white rounded-sm px-4 py-2">ALL ITEMS</TabsTrigger>
              <TabsTrigger value="lost" className="text-xs font-mono data-[state=active]:bg-[#111111] data-[state=active]:text-white rounded-sm px-4 py-2">LOST</TabsTrigger>
              <TabsTrigger value="found" className="text-xs font-mono data-[state=active]:bg-[#111111] data-[state=active]:text-white rounded-sm px-4 py-2">FOUND</TabsTrigger>
              <TabsTrigger value="resolved" className="text-xs font-mono data-[state=active]:bg-[#111111] data-[state=active]:text-white rounded-sm px-4 py-2">RESOLVED</TabsTrigger>
            </TabsList>
          </div>

          {/* Mobile Tabs (Select or Scroll) - Simplified for now, just hiding the list on mobile is bad UX, let's show it */}
          <div className="sm:hidden mb-6 overflow-x-auto pb-2">
            <TabsList className="bg-white border border-[#E5E5E5] p-1 h-auto inline-flex w-full">
              <TabsTrigger value="all" className="flex-1 text-[10px] font-mono data-[state=active]:bg-[#111111] data-[state=active]:text-white rounded-sm py-2">ALL</TabsTrigger>
              <TabsTrigger value="lost" className="flex-1 text-[10px] font-mono data-[state=active]:bg-[#111111] data-[state=active]:text-white rounded-sm py-2">LOST</TabsTrigger>
              <TabsTrigger value="found" className="flex-1 text-[10px] font-mono data-[state=active]:bg-[#111111] data-[state=active]:text-white rounded-sm py-2">FOUND</TabsTrigger>
              <TabsTrigger value="resolved" className="flex-1 text-[10px] font-mono data-[state=active]:bg-[#111111] data-[state=active]:text-white rounded-sm py-2">DONE</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all">
            <ItemsGrid items={items} />
          </TabsContent>
          
          <TabsContent value="lost">
            <ItemsGrid items={items.filter(i => i.type === "LOST")} />
          </TabsContent>
          
          <TabsContent value="found">
            <ItemsGrid items={items.filter(i => i.type === "FOUND")} />
          </TabsContent>
          
          <TabsContent value="resolved">
            <ItemsGrid items={items.filter(i => i.status === "RESOLVED")} />
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
}

function ItemsGrid({ items }: { items: Item[] }) {
  if (items.length === 0) {
    return (
      <div className="text-center py-20 border border-dashed border-[#E5E5E5] rounded-lg bg-white">
        <div className="w-16 h-16 bg-[#F2F2F2] rounded-full flex items-center justify-center mx-auto mb-4">
          <Package className="w-8 h-8 text-[#666666]" />
        </div>
        <h3 className="text-lg font-bold text-[#111111] mb-2">NO ITEMS FOUND</h3>
        <p className="text-[#666666] font-mono text-sm">NO ACTIVITY RECORDED IN THIS CATEGORY</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.05
          }
        }
      }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {items.map((item) => (
        <motion.div
          key={item.id}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
        >
          <ItemCard item={item} />
        </motion.div>
      ))}
    </motion.div>
  );
}