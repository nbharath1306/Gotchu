"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Calendar, CheckCircle, Package, Smartphone, Key, CreditCard, MessageCircle, Sparkles } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { createClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { resolveItem } from "@/app/actions"
import { useState } from "react"
import { motion } from "framer-motion"

interface Item {
  id: string
  type: 'LOST' | 'FOUND'
  title: string
  description?: string | null
  category: string
  location_zone: string
  status: 'OPEN' | 'RESOLVED'
  bounty_text?: string | null
  image_url?: string | null
  created_at: string
  user_id: string
}

interface ItemCardProps {
  item: Item
  currentUserId?: string
}

const categoryIcons: Record<string, React.ReactNode> = {
  Electronics: <Smartphone className="h-8 w-8" />,
  ID: <CreditCard className="h-8 w-8" />,
  Keys: <Key className="h-8 w-8" />,
  Other: <Package className="h-8 w-8" />,
}

const categoryEmojis: Record<string, string> = {
  Electronics: "📱",
  ID: "🪪",
  Keys: "🔑",
  Other: "📦",
}

export function ItemCard({ item, currentUserId }: ItemCardProps) {
  const isLost = item.type === 'LOST'
  const router = useRouter()
  const supabase = createClient()
  const [isResolving, setIsResolving] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handleContact = async () => {
    if (!currentUserId) {
      toast.error("Please login to contact the owner.")
      return
    }

    try {
      const { data: existingChats, error: fetchError } = await supabase
        .from('chats')
        .select('id')
        .eq('item_id', item.id)
        .or(`user_a.eq.${currentUserId},user_b.eq.${currentUserId}`)
      
      if (fetchError) throw fetchError

      if (existingChats && existingChats.length > 0) {
        router.push(`/chat/${existingChats[0].id}`)
        return
      }

      const { data: newChat, error: createError } = await supabase
        .from('chats')
        .insert({
          item_id: item.id,
          user_a: item.user_id,
          user_b: currentUserId
        })
        .select()
        .single()

      if (createError) throw createError
      router.push(`/chat/${newChat.id}`)

    } catch (error) {
      console.error("Error creating chat:", error)
      toast.error("Failed to start chat. Please try again.")
    }
  }

  const handleResolve = async () => {
    setIsResolving(true)
    try {
      const result = await resolveItem(item.id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(item.type === 'FOUND' ? "Item resolved! +50 Karma Points earned. ⭐" : "Item resolved!")
        router.refresh()
      }
    } catch (error) {
      toast.error("Something went wrong.")
    } finally {
      setIsResolving(false)
    }
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`group relative rounded-3xl overflow-hidden transition-all duration-500 ${
        item.status === 'RESOLVED' ? 'opacity-60' : ''
      }`}
    >
      {/* Glow Effect */}
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${
        isLost 
          ? 'from-red-500 via-orange-500 to-red-500' 
          : 'from-green-500 via-emerald-500 to-green-500'
      } rounded-3xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-500`} />
      
      {/* Card Content */}
      <div className="relative bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
        {/* Header with Gradient */}
        <div className={`relative h-32 ${
          isLost 
            ? 'bg-gradient-to-br from-red-500/20 via-orange-500/10 to-transparent' 
            : 'bg-gradient-to-br from-green-500/20 via-emerald-500/10 to-transparent'
        }`}>
          {/* Category Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ 
                scale: isHovered ? 1.1 : 1,
                rotate: isHovered ? 5 : 0 
              }}
              className={`h-20 w-20 rounded-2xl ${
                isLost 
                  ? 'bg-gradient-to-br from-red-500/30 to-orange-500/30 text-red-400' 
                  : 'bg-gradient-to-br from-green-500/30 to-emerald-500/30 text-green-400'
              } flex items-center justify-center backdrop-blur-sm border border-white/10`}
            >
              <span className="text-4xl">{categoryEmojis[item.category]}</span>
            </motion.div>
          </div>

          {/* Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            <Badge className={`${
              isLost 
                ? 'bg-red-500/90 hover:bg-red-500 shadow-lg shadow-red-500/25' 
                : 'bg-green-500/90 hover:bg-green-500 shadow-lg shadow-green-500/25'
            } text-white font-bold px-3 py-1`}>
              {item.type}
            </Badge>
          </div>

          {item.status === 'RESOLVED' && (
            <div className="absolute top-4 right-4">
              <Badge className="bg-zinc-800/90 text-zinc-300 border border-zinc-700">
                <CheckCircle className="h-3 w-3 mr-1" />
                Resolved
              </Badge>
            </div>
          )}

          {/* Floating Particles on Hover */}
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 pointer-events-none"
            >
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ 
                    y: -20, 
                    opacity: [0, 1, 0],
                    x: Math.random() * 40 - 20 
                  }}
                  transition={{ 
                    duration: 1.5, 
                    delay: i * 0.1,
                    repeat: Infinity 
                  }}
                  className={`absolute bottom-0 left-1/2 h-2 w-2 rounded-full ${
                    isLost ? 'bg-red-400' : 'bg-green-400'
                  }`}
                  style={{ left: `${20 + i * 15}%` }}
                />
              ))}
            </motion.div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-xl font-bold mb-2 group-hover:text-violet-400 transition-colors line-clamp-1">
              {item.title}
            </h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="border-white/10 bg-white/5 text-xs">
                {item.category}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center text-sm text-muted-foreground">
              <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center mr-3">
                <MapPin className="h-4 w-4 text-violet-400" />
              </div>
              <span>{item.location_zone.replace(/_/g, ' ')}</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <div className="h-8 w-8 rounded-lg bg-pink-500/10 flex items-center justify-center mr-3">
                <Calendar className="h-4 w-4 text-pink-400" />
              </div>
              <span>{formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}</span>
            </div>
          </div>
          
          {item.bounty_text && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-4 rounded-2xl border ${
                isLost 
                  ? 'bg-amber-500/10 border-amber-500/20' 
                  : 'bg-violet-500/10 border-violet-500/20'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className={`h-4 w-4 ${isLost ? 'text-amber-400' : 'text-violet-400'}`} />
                <span className={`text-sm font-semibold ${isLost ? 'text-amber-400' : 'text-violet-400'}`}>
                  {isLost ? "Reward" : "Drop-off"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{item.bounty_text}</p>
            </motion.div>
          )}

          {/* Action Button */}
          <div className="pt-2">
            {currentUserId === item.user_id ? (
              item.status === 'OPEN' ? (
                <Button 
                  variant="outline" 
                  className="w-full h-12 rounded-2xl border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20 hover:border-green-500/50 transition-all duration-300"
                  onClick={handleResolve}
                  disabled={isResolving}
                >
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Mark as Resolved
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  className="w-full h-12 rounded-2xl border-zinc-700 bg-zinc-800/50 text-zinc-500" 
                  disabled
                >
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Resolved
                </Button>
              )
            ) : (
              item.status === 'OPEN' ? (
                <Button 
                  onClick={handleContact}
                  className={`w-full h-12 rounded-2xl font-semibold text-white shadow-xl transition-all duration-300 hover:scale-[1.02] ${
                    isLost 
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-violet-500/25' 
                      : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 shadow-green-500/25'
                  }`}
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  {isLost ? "I Found This!" : "This is Mine!"}
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  className="w-full h-12 rounded-2xl border-zinc-700 bg-zinc-800/50 text-zinc-500" 
                  disabled
                >
                  Item Resolved
                </Button>
              )
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
