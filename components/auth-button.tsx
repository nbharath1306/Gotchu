"use client"

import { useUser } from "@auth0/nextjs-auth0/client"
import { LogOut } from "lucide-react"
import Link from "next/link"

export function AuthButton() {
  const { user, isLoading } = useUser()

  if (isLoading) return null

  if (!user) {
    return (
      <a
        href="/auth/login"
        className="btn-primary text-sm px-6 py-2"
      >
        LOGIN
      </a>
    )
  }

  return (
    <div className="flex items-center gap-4">
      <div className="hidden md:flex items-center gap-2 px-3 py-1.5 border border-[#E5E5E5] rounded-full bg-white">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-xs font-mono text-[#666666] truncate max-w-[150px]">
          {user.email}
        </span>
      </div>
      
      <a
        href="/auth/logout"
        className="p-2 text-[#666666] hover:text-black transition-colors"
        title="Sign Out"
      >
        <LogOut className="h-5 w-5" />
      </a>
    </div>
  )
}
