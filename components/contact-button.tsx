"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { startChat } from "@/app/actions"
import { MessageSquare, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface ContactButtonProps {
  itemId: string
  relatedItemId?: string
  label?: string
}

export function ContactButton({ itemId, relatedItemId, label = "CONTACT OWNER" }: ContactButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleContact = async () => {
    setIsLoading(true)
    try {
      const result = await startChat(itemId, relatedItemId)
      console.log("[ContactButton] startChat result:", result)

      if (result.error) {
        toast.error(result.error)
        // If "You cannot chat with yourself" (meaning you ARE the owner but UI didn't catch it), redirect to dashboard?
        // But for now just show error.
      } else if (result.chatId) {
        toast.success("Starting chat...")
        router.push(`/chat/${result.chatId}`)
      }
    } catch (error: unknown) {
      console.error("Failed to start chat:", error)
      toast.error("Something went wrong. Please try again.")
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
      {label}
    </button>
  )
}
