"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { 
  Radio,
  Shield,
  Search,
  Home,
  User
} from "lucide-react"
import { AuthButton } from "./auth-button"

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/feed", label: "Browse", icon: Search },
  { href: "/report/lost", label: "Lost", icon: Radio, accent: "alert" },
  { href: "/report/found", label: "Found", icon: Shield, accent: "success" },
  { href: "/profile", label: "Profile", icon: User },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop Top Bar */}
      <nav className="nav-topbar hidden md:flex fixed top-0 left-0 right-0 z-50 bg-[var(--bg-paper)]/90 backdrop-blur-md border-b border-[var(--border-default)] h-16 items-center px-6 justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <span className="font-display text-xl font-bold tracking-tight text-[var(--text-primary)]">GOTCHU</span>
          <span className="pill-tag">BETA</span>
        </Link>
        
        {/* Center Nav Items */}
        <div className="flex items-center gap-1">
          {navItems.slice(0, 4).map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <div className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? "bg-[var(--text-primary)] text-white" 
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
                }`}>
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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--bg-surface)] border-t border-[var(--border-default)] pb-safe">
        <div className="flex justify-around items-center h-16 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href} className="flex-1">
                <div className="flex flex-col items-center justify-center gap-1 py-2">
                  <div className={`p-1.5 rounded-full transition-colors ${
                    isActive ? "bg-[var(--text-primary)] text-white" : "text-[var(--text-secondary)]"
                  }`}>
                    <item.icon className="w-5 h-5" strokeWidth={2} />
                  </div>
                  <span className="text-[10px] font-medium text-[var(--text-secondary)]">{item.label}</span>
                </div>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
