"use client";

import Image from "next/image";
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
  LogOut
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { format } from "date-fns";

interface ProfileUser {
  name?: string;
  email?: string;
  picture?: string;
}

interface ProfileData {
  karma: number;
}

interface Item {
  id: string;
  title: string;
  type: "LOST" | "FOUND";
  status: "OPEN" | "RESOLVED";
  category: string;
  location_zone: string;
  created_at: string;
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

  return (
    <div className="min-h-screen bg-[var(--bg-paper)]">
      <div className="pt-24 md:pt-28 pb-32 md:pb-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-swiss overflow-hidden mb-6 bg-white"
          >
            {/* Banner */}
            <div className="h-24 bg-black relative" />
            
            {/* Profile Info */}
            <div className="px-6 sm:px-8 pb-8 -mt-12 relative">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6">
                {/* Avatar */}
                <div className="relative">
                  {user.picture ? (
                    <Image
                      src={user.picture}
                      alt={user.name || "Profile"}
                      width={96}
                      height={96}
                      className="rounded-full border-4 border-white"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-black flex items-center justify-center text-white text-3xl font-bold border-4 border-white">
                      {user.name?.charAt(0) || "U"}
                    </div>
                  )}
                  {karmaLevel >= 5 && (
                    <div className="absolute -top-1 -right-1 w-7 h-7 bg-yellow-400 rounded-full flex items-center justify-center border-2 border-white">
                      <Trophy className="h-3.5 w-3.5 text-black" />
                    </div>
                  )}
                </div>
                
                {/* Name & Email */}
                <div className="text-center sm:text-left flex-1 pb-2">
                  <h1 className="text-2xl font-display font-bold text-[var(--text-primary)] tracking-tight">{user.name}</h1>
                  <p className="text-[var(--text-secondary)] flex items-center justify-center sm:justify-start gap-2 mt-1 text-sm font-mono">
                    <Mail className="h-4 w-4" />
                    {user.email}
                  </p>
                </div>

                {/* Logout Button */}
                <div className="pb-2">
                  <a 
                    href="/auth/logout"
                    className="btn-primary px-4 py-2 text-xs flex items-center gap-2"
                  >
                    <LogOut className="h-3 w-3" />
                    DISCONNECT
                  </a>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Karma Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card-swiss p-6 bg-white"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold font-mono text-[var(--text-secondary)] uppercase tracking-wider">Karma Score</h3>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-4xl font-display font-bold text-[var(--text-primary)]">{karma}</span>
                <span className="text-sm font-mono text-[var(--text-secondary)] mb-1.5">PTS</span>
              </div>
              <div className="w-full bg-[var(--bg-surface)] h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-black h-full rounded-full" 
                  style={{ width: `${karmaProgress}%` }}
                />
              </div>
              <p className="text-[10px] font-mono text-[var(--text-secondary)] mt-2 text-right">
                LEVEL {karmaLevel} • {100 - karmaProgress} PTS TO NEXT
              </p>
            </motion.div>

            {/* Activity Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card-swiss p-6 bg-white md:col-span-2"
            >
              <h3 className="text-xs font-bold font-mono text-[var(--text-secondary)] uppercase tracking-wider mb-6">Activity Overview</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-[var(--bg-surface)] border border-[var(--border-default)]">
                  <Package className="h-5 w-5 mx-auto mb-2 text-[var(--text-secondary)]" />
                  <div className="text-2xl font-bold font-display">{itemsReported}</div>
                  <div className="text-[10px] font-mono text-[var(--text-secondary)] uppercase">Reported</div>
                </div>
                <div className="text-center p-4 bg-[var(--bg-surface)] border border-[var(--border-default)]">
                  <Search className="h-5 w-5 mx-auto mb-2 text-[var(--text-secondary)]" />
                  <div className="text-2xl font-bold font-display">{itemsFound}</div>
                  <div className="text-[10px] font-mono text-[var(--text-secondary)] uppercase">Found</div>
                </div>
                <div className="text-center p-4 bg-[var(--bg-surface)] border border-[var(--border-default)]">
                  <CheckCircle2 className="h-5 w-5 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold font-display">{itemsResolved}</div>
                  <div className="text-[10px] font-mono text-[var(--text-secondary)] uppercase">Resolved</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Recent Activity List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-lg font-display font-bold mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              RECENT LOGS
            </h2>
            
            {items.length === 0 ? (
              <div className="card-swiss p-12 text-center bg-white border-dashed">
                <p className="text-[var(--text-secondary)] font-mono text-sm">NO ACTIVITY RECORDED</p>
                <Link href="/report/lost" className="mt-4 inline-block text-xs font-bold underline decoration-2 underline-offset-4 hover:text-[var(--text-secondary)]">
                  FILE FIRST REPORT
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div 
                    key={item.id}
                    className="card-swiss p-4 bg-white hover:border-black transition-colors group"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-2 h-2 rounded-full ${
                          item.type === 'LOST' ? 'bg-red-500' : 'bg-blue-500'
                        }`} />
                        
                        <div>
                          <h3 className="font-bold text-sm">{item.title}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] font-mono text-[var(--text-secondary)] flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {item.location_zone.replace('_', ' ')}
                            </span>
                            <span className="text-[10px] font-mono text-[var(--text-secondary)]">
                              {format(new Date(item.created_at), 'MMM d, yyyy')}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className={`text-[10px] font-mono font-bold px-2 py-1 border ${
                          item.status === 'RESOLVED'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-default)]'
                        }`}>
                          {item.status}
                        </span>
                        <ArrowRight className="h-4 w-4 text-[var(--text-secondary)] group-hover:text-black transition-colors" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
