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
import { MapPin, Calendar } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { createClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

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
  
  return (
    <Card className="w-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold">{item.title}</CardTitle>
            <div className="flex gap-2">
              <Badge variant={isLost ? "destructive" : "default"} className={isLost ? "bg-red-500" : "bg-green-500"}>
                {item.type}
              </Badge>
              <Badge variant="outline">{item.category}</Badge>
              {item.status === 'RESOLVED' && <Badge variant="secondary">RESOLVED</Badge>}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="mr-2 h-4 w-4" />
          {item.location_zone.replace('_', ' ')}
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="mr-2 h-4 w-4" />
          {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
        </div>
        
        {item.bounty_text && (
          <div className="mt-2 p-2 bg-zinc-100 dark:bg-zinc-900 rounded-md text-sm">
            <span className="font-semibold">{isLost ? "Bounty:" : "Drop-off:"}</span> {item.bounty_text}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {currentUserId === item.user_id ? (
           <Button variant="outline" className="w-full">Manage</Button>
        ) : (
          <Button 
            onClick={handleContact}
            className={`w-full ${isLost ? 'bg-violet-600 hover:bg-violet-700' : 'bg-green-600 hover:bg-green-700'}`}
          >
            {isLost ? "I Found This!" : "This is Mine!"}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
