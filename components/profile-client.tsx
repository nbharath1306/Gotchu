"use client";

import {
  Mail,
  Trophy,
  Shield,
  MapPin,
  Radio,
  CheckCircle2,
  Package,
} from "lucide-react";
import { motion } from "framer-motion";
import { Item } from "@/types";
import { ItemCard } from "@/components/item-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HolographicCard } from "@/components/ui/holographic-card";
import { NeonBadge } from "@/components/ui/neon-badge";
import { MatrixGrid } from "@/components/ui/matrix-grid";

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

const pointsToColor = (points: number) => {
  if (points >= 500) return "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]";
  if (points >= 100) return "bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]";
  return "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]";
};

export function ProfileClient({ user, profile, items }: ProfileClientProps) {
  const karma = profile?.karma || 0;
  const itemsReported = items.filter(i => i.type === "LOST").length;
  const itemsFound = items.filter(i => i.type === "FOUND").length;
  const itemsResolved = items.filter(i => i.status === "RESOLVED").length;

  const getBadge = (points: number) => {
    if (points >= 500) return { label: "LEGEND", variant: "amber" as const, icon: Trophy, next: null, nextThreshold: null };
    if (points >= 100) return { label: "GUARDIAN", variant: "blue" as const, icon: Shield, next: "Legend", nextThreshold: 500 };
    return { label: "SCOUT", variant: "emerald" as const, icon: MapPin, next: "Guardian", nextThreshold: 100 };
  };

  const badge = getBadge(karma);
  const nextTarget = badge.nextThreshold ? badge.nextThreshold - karma : 0;
  const progressPercent = badge.nextThreshold
    ? ((karma - (badge.nextThreshold === 500 ? 100 : 0)) / (badge.nextThreshold - (badge.nextThreshold === 500 ? 100 : 0))) * 100
    : 100;

  const safeProgress = Math.min(Math.max(progressPercent, 5), 100);

  return (
    <div className="min-h-screen bg-black relative pt-24 pb-20 px-4 sm:px-6">
      <MatrixGrid />
      <div className="relative z-10 max-w-6xl mx-auto">

        {/* Header Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* User Dossier Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2"
          >
            <HolographicCard className="p-8 h-full flex flex-col sm:flex-row items-start sm:items-center gap-8">
              <div className="relative">
                <div className="relative z-10">
                  {user.picture ? (
                    <img
                      src={user.picture}
                      alt={user.name || "Profile"}
                      className="w-[120px] h-[120px] rounded-full border-2 border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.1)] object-cover"
                    />
                  ) : (
                    <div className="w-[120px] h-[120px] rounded-full bg-white/5 flex items-center justify-center border-2 border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                      <span className="text-4xl font-bold text-white/20">{user.name?.charAt(0) || "U"}</span>
                    </div>
                  )}

                  {/* Tier Badge */}
                  <div className="absolute -bottom-3 -right-3">
                    <NeonBadge variant={badge.variant} pulsing className="shadow-lg backdrop-blur-xl">
                      <div className="flex items-center gap-1.5">
                        <badge.icon className="w-3 h-3" />
                        <span className="tracking-wider text-[10px] font-bold">{badge.label}</span>
                      </div>
                    </NeonBadge>
                  </div>
                </div>

                {/* Rotating Ring Effect */}
                <div className="absolute -inset-4 border border-dashed border-white/10 rounded-full animate-[spin_10s_linear_infinite]" />
              </div>

              <div className="flex-1 w-full">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-4">
                  <div>
                    <h1 className="text-3xl font-display font-medium text-white tracking-tighter mb-1">{user.name}</h1>
                    <div className="flex items-center gap-2 text-white/40 font-mono text-xs">
                      <Mail className="w-3 h-3" />
                      {user.email}
                    </div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <div className="text-3xl font-medium text-white tabular-nums tracking-tighter">{karma}</div>
                    <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest font-mono">Reputation Score</div>
                  </div>
                </div>

                {/* Reputation Progress Core */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 opacity-10">
                    <Trophy className="w-12 h-12 text-white" />
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest mb-3 relative z-10">
                    <span className="text-white/60">Current Rank: <span className="text-white">{badge.label}</span></span>
                    {badge.next ? (
                      <span className="text-white/40">{nextTarget} PTS TO {badge.next}</span>
                    ) : (
                      <span className="text-amber-400 animate-pulse">MAXIMUM RANK ACHIEVED</span>
                    )}
                  </div>

                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden relative z-10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${safeProgress}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className={`h-full rounded-full ${pointsToColor(karma)}`}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 w-full sm:w-auto mt-4 sm:mt-0 absolute top-8 right-8 lg:static lg:mt-0">
                <a href="/auth/logout" className="px-4 py-2 text-[10px] font-bold font-mono text-red-400 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 rounded-lg transition-colors uppercase tracking-wider text-center">
                  Terminate Session
                </a>
              </div>
            </HolographicCard>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <HolographicCard className="p-8 h-full flex flex-col justify-center">
              <h3 className="label-caps mb-6 text-white/30">OPERATIONAL METRICS</h3>
              <div className="grid grid-cols-2 gap-y-8 gap-x-4">
                <div>
                  <div className="text-3xl font-medium text-white mb-1 tracking-tighter">{itemsReported}</div>
                  <div className="text-[10px] font-mono text-white/40 flex items-center gap-1.5 uppercase tracking-wider">
                    <Radio className="w-3 h-3 text-rose-400" /> LOST
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-medium text-white mb-1 tracking-tighter">{itemsFound}</div>
                  <div className="text-[10px] font-mono text-white/40 flex items-center gap-1.5 uppercase tracking-wider">
                    <Shield className="w-3 h-3 text-amber-400" /> FOUND
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-medium text-white mb-1 tracking-tighter">{itemsResolved}</div>
                  <div className="text-[10px] font-mono text-white/40 flex items-center gap-1.5 uppercase tracking-wider">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> RESOLVED
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-medium text-white mb-1 tracking-tighter">{karma}</div>
                  <div className="text-[10px] font-mono text-white/40 flex items-center gap-1.5 uppercase tracking-wider">
                    <Trophy className="w-3 h-3 text-purple-400" /> REP
                  </div>
                </div>
              </div>
            </HolographicCard>
          </motion.div>
        </div>

        {/* Assets Log */}
        <div className="space-y-6">
          <h2 className="text-xl font-display font-medium text-white tracking-tight flex items-center gap-3">
            <span className="w-1 h-6 bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]"></span>
            ASSET LOG
          </h2>

          <Tabs defaultValue="all" className="w-full">
            <div className="mb-6 overflow-x-auto pb-2 no-scrollbar">
              <TabsList className="bg-white/5 border border-white/10 p-1 h-auto inline-flex rounded-xl backdrop-blur-md">
                <TabsTrigger value="all" className="text-[10px] font-mono font-bold uppercase tracking-wider data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/40 rounded-lg px-4 py-2 transition-all">All Assets</TabsTrigger>
                <TabsTrigger value="lost" className="text-[10px] font-mono font-bold uppercase tracking-wider data-[state=active]:bg-rose-500/10 data-[state=active]:text-rose-400 text-white/40 rounded-lg px-4 py-2 transition-all">Lost Signal</TabsTrigger>
                <TabsTrigger value="found" className="text-[10px] font-mono font-bold uppercase tracking-wider data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-400 text-white/40 rounded-lg px-4 py-2 transition-all">Found Signal</TabsTrigger>
                <TabsTrigger value="resolved" className="text-[10px] font-mono font-bold uppercase tracking-wider data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-400 text-white/40 rounded-lg px-4 py-2 transition-all">Resolved</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all" className="mt-0">
              <ItemsGrid items={items} />
            </TabsContent>
            <TabsContent value="lost" className="mt-0">
              <ItemsGrid items={items.filter(i => i.type === "LOST")} />
            </TabsContent>
            <TabsContent value="found" className="mt-0">
              <ItemsGrid items={items.filter(i => i.type === "FOUND")} />
            </TabsContent>
            <TabsContent value="resolved" className="mt-0">
              <ItemsGrid items={items.filter(i => i.status === "RESOLVED")} />
            </TabsContent>
          </Tabs>
        </div>

      </div>
    </div>
  );
}

function ItemsGrid({ items }: { items: Item[] }) {
  if (items.length === 0) {
    return (
      <HolographicCard className="p-12 text-center border-dashed border-white/10 bg-transparent shadow-none">
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10 animate-pulse">
          <Package className="w-6 h-6 text-white/20" />
        </div>
        <h3 className="text-lg font-medium text-white mb-2 tracking-tight">NO ASSETS LOGGED</h3>
        <p className="text-white/30 font-mono text-xs tracking-widest uppercase">Database empty for this category</p>
      </HolographicCard>
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
          transition: { staggerChildren: 0.05 }
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