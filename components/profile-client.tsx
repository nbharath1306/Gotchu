"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ItemCard } from "@/components/item-card"
import { motion } from "framer-motion"
import { Star, Package, CheckCircle, AlertCircle, LogOut, Settings, TrendingUp, Award, Sparkles } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

interface ProfileClientProps {
  user: {
    id: string
    name?: string | null
    email?: string | null
    picture?: string | null
  }
  userData: {
    karma_points?: number
    is_admin?: boolean
  } | null
  items: any[]
}

export function ProfileClient({ user, userData, items }: ProfileClientProps) {
  const [activeTab, setActiveTab] = useState<"all" | "open" | "resolved">("all")

  const openItems = items.filter(item => item.status === 'OPEN')
  const resolvedItems = items.filter(item => item.status === 'RESOLVED')
  const lostItems = items.filter(item => item.type === 'LOST')
  const foundItems = items.filter(item => item.type === 'FOUND')
  const karmaPoints = userData?.karma_points || 0

  const filteredItems = activeTab === "all" 
    ? items 
    : activeTab === "open" 
      ? openItems 
      : resolvedItems

  const stats = [
    { label: "Karma Points", value: karmaPoints, icon: Star, color: "amber", suffix: "⭐" },
    { label: "Total Items", value: items.length, icon: Package, color: "violet" },
    { label: "Open", value: openItems.length, icon: AlertCircle, color: "orange" },
    { label: "Resolved", value: resolvedItems.length, icon: CheckCircle, color: "green" },
  ]

  const tabs = [
    { id: "all" as const, label: "All Items", count: items.length },
    { id: "open" as const, label: "Open", count: openItems.length },
    { id: "resolved" as const, label: "Resolved", count: resolvedItems.length },
  ]

  // Calculate rank based on karma
  const getRank = (karma: number) => {
    if (karma >= 500) return { name: "Legend", color: "from-amber-400 to-orange-500", emoji: "👑" }
    if (karma >= 200) return { name: "Hero", color: "from-violet-400 to-purple-500", emoji: "🦸" }
    if (karma >= 100) return { name: "Helper", color: "from-blue-400 to-cyan-500", emoji: "🌟" }
    if (karma >= 50) return { name: "Rising Star", color: "from-green-400 to-emerald-500", emoji: "⭐" }
    return { name: "Newcomer", color: "from-zinc-400 to-zinc-500", emoji: "🌱" }
  }

  const rank = getRank(karmaPoints)

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-violet-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-pink-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto py-8 px-4 max-w-5xl">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-10"
        >
          {/* Cover Gradient */}
          <div className="h-48 rounded-3xl bg-gradient-to-r from-violet-500/30 via-pink-500/20 to-indigo-500/30 overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAzMHYySDE0di0yaDIyem0wLTR2Mkg2di0yaDMweiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
            
            {/* Decorative Elements */}
            <motion.div
              animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
              className="absolute top-8 right-8 text-4xl"
            >
              ✨
            </motion.div>
            <motion.div
              animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
              className="absolute bottom-8 right-24 text-3xl"
            >
              🌟
            </motion.div>
          </div>

          {/* Profile Info */}
          <div className="relative px-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-16">
              {/* Avatar */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="relative"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-violet-500 to-pink-500 rounded-3xl blur opacity-50" />
                <Avatar className="relative h-32 w-32 rounded-3xl border-4 border-zinc-900 shadow-2xl">
                  <AvatarImage src={user.picture || ''} alt={user.name || 'User'} className="object-cover" />
                  <AvatarFallback className="text-4xl bg-gradient-to-br from-violet-500 to-pink-500 text-white rounded-3xl">
                    {user.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                {/* Online Indicator */}
                <span className="absolute bottom-2 right-2 h-5 w-5 rounded-full bg-green-500 border-4 border-zinc-900" />
              </motion.div>
              
              {/* User Details */}
              <div className="flex-1">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h1 className="text-3xl font-bold mb-1">{user.name || 'Anonymous User'}</h1>
                  <p className="text-muted-foreground mb-3">{user.email}</p>
                  
                  {/* Rank Badge */}
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${rank.color} text-white text-sm font-bold shadow-lg`}>
                    <span>{rank.emoji}</span>
                    <span>{rank.name}</span>
                  </div>
                </motion.div>
              </div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="flex gap-3"
              >
                <Link href="/auth/logout">
                  <Button 
                    variant="outline" 
                    className="h-12 px-6 rounded-2xl border-white/10 bg-white/5 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className="group relative rounded-2xl overflow-hidden"
            >
              <div className="relative p-6 rounded-2xl bg-zinc-900/80 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all">
                <stat.icon className={`h-6 w-6 text-${stat.color}-400 mb-3`} />
                <div className="text-3xl font-bold mb-1">
                  {stat.value}
                  {stat.suffix && <span className="ml-1 text-xl">{stat.suffix}</span>}
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Items Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="rounded-3xl bg-zinc-900/50 backdrop-blur-xl border border-white/10 p-6 md:p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
                <Package className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-bold">Your Items</h2>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 p-1.5 rounded-2xl bg-zinc-800/50 border border-white/5 mb-8">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-300 ${
                  activeTab === tab.id 
                    ? "text-white" 
                    : "text-muted-foreground hover:text-white"
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="profileActiveTab"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 shadow-lg"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {tab.label}
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id 
                      ? "bg-white/20" 
                      : "bg-white/5"
                  }`}>
                    {tab.count}
                  </span>
                </span>
              </motion.button>
            ))}
          </div>

          {/* Items Grid */}
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ItemCard item={item} currentUserId={user.id} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <motion.div
                animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="h-20 w-20 rounded-3xl bg-gradient-to-br from-violet-500/20 to-pink-500/20 flex items-center justify-center mb-6 border border-white/10"
              >
                <Sparkles className="h-10 w-10 text-violet-400" />
              </motion.div>
              <h3 className="text-xl font-bold mb-2">No items yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                You haven't reported any items yet. Start helping the community!
              </p>
              <div className="flex gap-3">
                <Link href="/report/lost">
                  <Button className="rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400">
                    Report Lost
                  </Button>
                </Link>
                <Link href="/report/found">
                  <Button className="rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400">
                    Report Found
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
