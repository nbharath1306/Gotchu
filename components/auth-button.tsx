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
import { User, LogOut } from "lucide-react";

export function AuthButton() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="h-9 w-9 rounded-full bg-gray-100 animate-pulse" />
    );
  }

  if (!user) {
    return (
      <Link href="/api/auth/login">
        <Button className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-6">
          Sign In
        </Button>
      </Link>
    );
  }

  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
          <Avatar className="h-9 w-9 border border-gray-200">
            <AvatarImage src={user.picture || ""} alt={user.name || "User"} />
            <AvatarFallback className="bg-gray-100 text-gray-700 text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-white border border-gray-200 shadow-lg rounded-xl p-2">
        <div className="px-3 py-2">
          <p className="text-sm font-medium text-gray-900">{user.name}</p>
          <p className="text-xs text-gray-500 truncate">{user.email}</p>
        </div>
        <DropdownMenuSeparator className="bg-gray-100" />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center gap-2 px-3 py-2 cursor-pointer text-gray-700 hover:bg-gray-50 rounded-lg">
            <User className="h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-gray-100" />
        <DropdownMenuItem asChild>
          <a href="/api/auth/logout" className="flex items-center gap-2 px-3 py-2 cursor-pointer text-red-600 hover:bg-red-50 rounded-lg">
            <LogOut className="h-4 w-4" />
            Sign Out
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
