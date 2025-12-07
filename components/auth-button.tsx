"use client"

import { useUser } from '@auth0/nextjs-auth0/client';
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, Loader2, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

export default function AuthButton() {
  const { user, error, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading...</span>
      </div>
    )
  }
  
  if (error) {
    return <div className="text-sm text-red-400">{error.message}</div>;
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <Link href="/profile">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-violet-500/30 transition-all cursor-pointer"
          >
            <div className="relative">
              <Avatar className="h-8 w-8 border-2 border-violet-500/50">
                <AvatarImage src={user.picture || ''} alt={user.name || 'User'} />
                <AvatarFallback className="bg-gradient-to-br from-violet-500 to-pink-500 text-white text-sm">
                  {user.name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-zinc-900" />
            </div>
            <span className="text-sm font-medium hidden sm:inline-block">
              {user.name?.split(' ')[0] || 'User'}
            </span>
          </motion.div>
        </Link>
        <a href="/auth/logout">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-10 px-4 rounded-xl border-white/10 bg-white/5 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </motion.div>
        </a>
      </div>
    )
  }

  return (
    <a href="/auth/login">
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button 
          size="sm" 
          className="h-10 px-6 rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-400 hover:to-pink-400 text-white shadow-lg shadow-violet-500/25 transition-all"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Login
        </Button>
      </motion.div>
    </a>
  )
}
