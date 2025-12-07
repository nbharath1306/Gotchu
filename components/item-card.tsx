"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import { MapPin, Calendar, CheckCircle, Package, Smartphone, Key, CreditCard, MoreHorizontal } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { createClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { resolveItem } from "@/app/actions"
import { useState } from "react"
import Image from "next/image"

interface Item {
  id: string
  type: 'LOST' | 'FOUND'
  title: string
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
  Electronics: <Smartphone className="h-6 w-6" />,
  ID: <CreditCard className="h-6 w-6" />,
  Keys: <Key className="h-6 w-6" />,
  Other: <Package className="h-6 w-6" />,
}

export function ItemCard({ item, currentUserId }: ItemCardProps) {
  const isLost = item.type === 'LOST'
  const router = useRouter()
  const supabase = createClient()
  const [isResolving, setIsResolving] = useState(false)

  const handleContact = async () => {
    if (!currentUserId) {
      toast.error("Please login to contact the owner.")
      return
    }

    try {
      // 1. Check if chat already exists
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

      // 2. Create new chat
      // user_a is the item owner, user_b is the responder
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
        toast.success(item.type === 'FOUND' ? "Item resolved! +50 Karma Points earned." : "Item resolved!")
        router.refresh()
      }
    } catch (error) {
      toast.error("Something went wrong.")
    } finally {
      setIsResolving(false)
    }
  }
  
  return (
    <Card className={`w-full overflow-hidden glass border-white/10 hover:shadow-xl transition-all duration-300 group ${item.status === 'RESOLVED' ? 'opacity-60' : ''}`}>
      {/* Image or Category Icon Header */}
      <div className={`relative h-32 ${isLost ? 'bg-gradient-to-br from-red-500/20 to-orange-500/20' : 'bg-gradient-to-br from-green-500/20 to-emerald-500/20'}`}>
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`h-16 w-16 rounded-full ${isLost ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'} flex items-center justify-center`}>
              {categoryIcons[item.category] || <Package className="h-6 w-6" />}
            </div>
          </div>
        )}
        {/* Type Badge */}
        <div className="absolute top-3 left-3">
          <Badge className={`${isLost ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white font-medium`}>
            {item.type}
          </Badge>
        </div>
        {/* Status Badge */}
        {item.status === 'RESOLVED' && (
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="bg-zinc-800/80 text-zinc-300">
              <CheckCircle className="h-3 w-3 mr-1" />
              Resolved
            </Badge>
          </div>
        )}
      </div>

      <CardHeader className="pb-2 pt-4">
        <h3 className="text-lg font-bold group-hover:text-violet-500 transition-colors line-clamp-1">
          {item.title}
        </h3>
        <div className="flex gap-2 mt-1">
          <Badge variant="outline" className="border-white/10 bg-white/5 text-xs">
            {item.category}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-2 pb-3">
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="mr-2 h-4 w-4 text-violet-500 flex-shrink-0" />
          <span className="truncate">{item.location_zone.replace(/_/g, ' ')}</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="mr-2 h-4 w-4 text-violet-500 flex-shrink-0" />
          {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
        </div>
        
        {item.bounty_text && (
          <div className="mt-3 p-3 bg-white/5 rounded-lg text-sm border border-white/5">
            <span className={`font-semibold ${isLost ? 'text-amber-400' : 'text-violet-400'}`}>
              {isLost ? "🎁 Reward:" : "📍 Drop-off:"}
            </span>{" "}
            <span className="text-muted-foreground">{item.bounty_text}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between gap-2">
        {currentUserId === item.user_id ? (
           item.status === 'OPEN' ? (
             <Button 
               variant="outline" 
               className="w-full border-green-600/50 text-green-600 hover:bg-green-500/10 hover:border-green-600"
               onClick={handleResolve}
               disabled={isResolving}
             >
               <CheckCircle className="mr-2 h-4 w-4" />
               Mark as Resolved
             </Button>
           ) : (
             <Button variant="secondary" className="w-full bg-white/5 text-muted-foreground" disabled>Resolved</Button>
           )
        ) : (
          item.status === 'OPEN' ? (
            <Button 
              onClick={handleContact}
              className={`w-full shadow-lg ${isLost ? 'bg-violet-600 hover:bg-violet-700 shadow-violet-500/20' : 'bg-green-600 hover:bg-green-700 shadow-green-500/20'}`}
            >
              {isLost ? "I Found This!" : "This is Mine!"}
            </Button>
          ) : (
            <Button variant="secondary" className="w-full bg-white/5 text-muted-foreground" disabled>Item Resolved</Button>
          )
        )}
      </CardFooter>
    </Card>
  )
}
