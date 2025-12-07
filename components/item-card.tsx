"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { MapPin, Calendar, CheckCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { createClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { resolveItem } from "@/app/actions"
import { useState } from "react"

interface Item {
  id: string
  type: 'LOST' | 'FOUND'
  title: string
  category: string
  location_zone: string
  status: 'OPEN' | 'RESOLVED'
  bounty_text?: string | null
  created_at: string
  user_id: string
}

interface ItemCardProps {
  item: Item
  currentUserId?: string
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
    <Card className="w-full glass border-white/10 hover:shadow-lg hover:shadow-violet-500/5 transition-all duration-300 group">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold group-hover:text-violet-500 transition-colors">{item.title}</CardTitle>
            <div className="flex gap-2">
              <Badge variant={isLost ? "destructive" : "default"} className={isLost ? "bg-red-500/80 hover:bg-red-500" : "bg-green-500/80 hover:bg-green-500"}>
                {item.type}
              </Badge>
              <Badge variant="outline" className="border-white/10 bg-white/5">{item.category}</Badge>
              {item.status === 'RESOLVED' && <Badge variant="secondary" className="bg-zinc-800 text-zinc-400">RESOLVED</Badge>}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="mr-2 h-4 w-4 text-violet-500" />
          {item.location_zone.replace('_', ' ')}
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="mr-2 h-4 w-4 text-violet-500" />
          {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
        </div>
        
        {item.bounty_text && (
          <div className="mt-2 p-3 bg-white/5 rounded-lg text-sm border border-white/5">
            <span className="font-semibold text-violet-400">{isLost ? "Bounty:" : "Drop-off:"}</span> {item.bounty_text}
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
