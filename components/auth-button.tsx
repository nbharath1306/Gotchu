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
import { User, LogOut, Loader2 } from "lucide-react";

export function AuthButton() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return <Loader2 className="h-5 w-5 animate-spin text-slate-400" />;
  }

  if (!user) {
    return (
      <Link href="/api/auth/login">
        <Button className="bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg shadow-sm transition-all hover:shadow-md">
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
        <Button variant="ghost" className="h-10 w-10 rounded-full p-0 hover:bg-slate-100 transition-colors">
          <Avatar className="h-9 w-9 border border-slate-200 shadow-sm">
            <AvatarImage src={user.picture || ""} alt={user.name || "User"} />
            <AvatarFallback className="bg-slate-100 text-slate-600 font-medium text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-2 rounded-lg border-slate-200 shadow-lg bg-white">
        <div className="px-3 py-2.5">
          <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
          <p className="text-xs text-slate-500 truncate">{user.email}</p>
        </div>
        <DropdownMenuSeparator className="bg-slate-100" />
        <DropdownMenuItem asChild className="rounded-md focus:bg-slate-50 focus:text-slate-900 cursor-pointer">
          <Link href="/profile" className="flex items-center w-full">
            <User className="mr-2 h-4 w-4 text-slate-500" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-slate-100" />
        <DropdownMenuItem asChild className="rounded-md focus:bg-red-50 focus:text-red-600 cursor-pointer text-red-600">
          <Link href="/api/auth/logout" className="flex items-center w-full">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
