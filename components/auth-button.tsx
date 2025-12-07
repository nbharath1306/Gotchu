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
          <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
            <AvatarImage src={user.picture || ""} alt={user.name || "User"} />
            <AvatarFallback className="bg-teal-50 text-teal-700 font-medium text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl border-slate-100 shadow-xl bg-white/95 backdrop-blur-sm">
        <div className="px-3 py-2.5">
          <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
          <p className="text-xs text-slate-500 truncate">{user.email}</p>
        </div>
        <DropdownMenuSeparator className="bg-slate-100 my-1" />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-slate-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg cursor-pointer transition-colors">
            <User className="h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href="/api/auth/logout" className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors">
            <LogOut className="h-4 w-4" />
            Sign Out
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
