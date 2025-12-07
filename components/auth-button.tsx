"use client";

import { useUser } from "@auth0/nextjs-auth0";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Settings } from "lucide-react";

export function AuthButton() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="h-9 w-20 bg-zinc-800 rounded-lg animate-pulse" />
    );
  }

  if (!user) {
    return (
      <Link href="/api/auth/login">
        <Button 
          size="sm" 
          className="bg-white text-black hover:bg-zinc-200 font-medium"
        >
          Sign In
        </Button>
      </Link>
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
          className="h-9 w-9 rounded-full p-0 hover:bg-zinc-800"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.picture || ""} alt={user.name || "User"} />
            <AvatarFallback className="bg-zinc-700 text-white text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-56 bg-zinc-900 border-zinc-800"
      >
        <div className="px-3 py-2">
          <p className="text-sm font-medium text-white">{user.name}</p>
          <p className="text-xs text-zinc-500 truncate">{user.email}</p>
        </div>
        <DropdownMenuSeparator className="bg-zinc-800" />
        <DropdownMenuItem asChild>
          <Link 
            href="/profile" 
            className="flex items-center gap-2 text-zinc-300 hover:text-white cursor-pointer"
          >
            <User className="h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link 
            href="/profile" 
            className="flex items-center gap-2 text-zinc-300 hover:text-white cursor-pointer"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-zinc-800" />
        <DropdownMenuItem asChild>
          <a 
            href="/api/auth/logout" 
            className="flex items-center gap-2 text-red-400 hover:text-red-300 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
