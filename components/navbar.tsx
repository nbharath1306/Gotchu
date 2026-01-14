"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
// import { motion } from "framer-motion"
import {
  Radio,
  Shield,
  Search,
  Home,
  User,
  MessageSquare
} from "lucide-react"
import { AuthButton } from "./auth-button"

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/feed", label: "Browse", icon: Search },
  { href: "/chat", label: "Messages", icon: MessageSquare },
  { href: "/report/lost", label: "Lost", icon: Radio, accent: "alert" },
  { href: "/report/found", label: "Found", icon: Shield, accent: "success" },
  { href: "/profile", label: "Profile", icon: User },
]

export function Navbar() {
  const pathname = usePathname()

  if (pathname === "/" || pathname.startsWith("/report")) return null

  return (
    <>
      {/* Desktop Top Bar */}
      <nav className="nav-topbar hidden md:flex fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/10 h-16 items-center px-6 justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <span className="font-display text-xl font-bold tracking-tight text-white">GOTCHU</span>
          <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-[10px] font-mono font-bold text-purple-300 border border-purple-500/30">BETA</span>
        </Link>

        {/* Center Nav Items */}
        <div className="flex items-center gap-1">
          {navItems.slice(0, 5).map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <div className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${isActive
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}>
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </div>
              </Link>
            )
          })}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          <AuthButton />
        </div>
      </nav>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-t border-white/10 pb-safe">
        <div className="flex justify-around items-center h-16 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href} className="flex-1">
                <div className="flex flex-col items-center justify-center gap-1 py-2">
                  <div className={`p-1.5 rounded-full transition-colors ${isActive ? "bg-white/10 text-white" : "text-white/60"
                    }`}>
                    <item.icon className="w-5 h-5" strokeWidth={2} />
                  </div>
                  <span className={`text-[10px] font-medium ${isActive ? "text-white" : "text-white/60"}`}>{item.label}</span>
                </div>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
