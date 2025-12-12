"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { startChat } from "@/app/actions"
import { MessageSquare, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface ContactButtonProps {
  itemId: string
}

export function ContactButton({ itemId }: ContactButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleContact = async () => {
    setIsLoading(true)
    try {
      const result = await startChat(itemId)
      console.log("[ContactButton] startChat result:", result)
      if (result.error) {
        toast.error(result.error)
        setIsLoading(false)
        return
      }
      if (result.chatId) {
        toast.success("Chat ready! Redirecting...")
        router.push(`/chat/${result.chatId}`)
      } else {
        toast.error("No chat ID returned from server.")
      }
    } catch (error: any) {
      console.error("Failed to start chat:", error)
      toast.error(error?.message || "Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleContact}
      disabled={isLoading}
      className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-lg"
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <MessageSquare className="w-5 h-5" />
      )}
      CONTACT OWNER
    </button>
  )
}
