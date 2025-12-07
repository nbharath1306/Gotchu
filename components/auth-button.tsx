"use client";

import { useUser } from "@auth0/nextjs-auth0";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Loader2 } from "lucide-react";
import Link from "next/link";

export function AuthButton() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" disabled className="text-zinc-500">
        <Loader2 className="w-4 h-4 animate-spin" />
      </Button>
    );
  }

  if (!user) {
    return (
      <a href="/auth/login">
        <Button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-medium px-5 h-9 rounded-full shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 transition-all">
          Sign In
        </Button>
      </a>
    );
  }

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="relative h-9 w-9 rounded-full p-0 ring-2 ring-violet-500/20 hover:ring-violet-500/40 transition-all"
        >
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.picture || ""} alt={user.name || "User"} />
            <AvatarFallback className="bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-56 bg-zinc-900/95 backdrop-blur-xl border-zinc-800 text-white p-2 rounded-xl"
      >
        <div className="px-3 py-2">
          <p className="text-sm font-medium text-white">{user.name}</p>
          <p className="text-xs text-zinc-500 truncate">{user.email}</p>
        </div>
        <DropdownMenuSeparator className="bg-zinc-800" />
        <DropdownMenuItem asChild className="rounded-lg cursor-pointer hover:bg-white/5 focus:bg-white/5">
          <Link href="/profile" className="flex items-center gap-2 text-zinc-300">
            <User className="w-4 h-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-zinc-800" />
        <DropdownMenuItem asChild className="rounded-lg cursor-pointer hover:bg-red-500/10 focus:bg-red-500/10 text-red-400">
          <a href="/api/auth/logout" className="flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            Sign Out
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
