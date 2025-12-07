"use client"

import { useUser } from '@auth0/nextjs-auth0/client';
import { Button } from "@/components/ui/button"

export default function AuthButton() {
  const { user, error, isLoading } = useUser();

  if (isLoading) return <div className="text-sm text-muted-foreground">Loading...</div>;
  if (error) return <div className="text-sm text-red-500">{error.message}</div>;

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">Hi, {user.name?.split(' ')[0] || 'User'}</span>
        <a href="/auth/logout">
          <Button variant="outline" size="sm" className="glass border-white/10 hover:bg-white/10">
            Logout
          </Button>
        </a>
      </div>
    )
  }

  return (
    <a href="/auth/login">
      <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/20">
        Login
      </Button>
    </a>
  )
}
