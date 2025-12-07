"use client"

import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-zinc-400">Hi, {user.user_metadata.full_name?.split(' ')[0] || 'User'}</span>
        <Button onClick={handleLogout} variant="outline" size="sm">
          Logout
        </Button>
      </div>
    )
  }

  return (
    <Button onClick={handleLogin} variant="default" size="sm" className="bg-violet-600 hover:bg-violet-700">
      Login with Google
    </Button>
  )
}
