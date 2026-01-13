"use client"

import { useState, useRef, useEffect } from "react"
import { useUser } from "@auth0/nextjs-auth0/client"
import { LogOut, User, ChevronDown, LayoutDashboard, Shield } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

export function AuthButton() {
  const { user, isLoading } = useUser()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  if (isLoading) return <div className="h-10 w-24 bg-gray-100 animate-pulse rounded-full" />

  if (!user) {
    return (
      <a
        href="/auth/login"
        className="btn-primary text-sm px-6 py-2"
      >
        LOGIN
      </a>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-[#E5E5E5] bg-white hover:border-black transition-colors duration-200 group"
      >
        {user.picture ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.picture}
            alt={user.name || "User"}
            className="w-8 h-8 rounded-full border border-[#E5E5E5] group-hover:border-gray-400 transition-colors"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-[#F2F2F2] flex items-center justify-center border border-[#E5E5E5]">
            <User className="w-4 h-4 text-[#666666]" />
          </div>
        )}
        <span className="text-xs font-bold text-[#111111] hidden md:block max-w-[100px] truncate">
          {user.name || user.email}
        </span>
        <ChevronDown className={`w-4 h-4 text-[#666666] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className="absolute right-0 mt-2 w-64 bg-white border border-[#E5E5E5] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] z-50 overflow-hidden"
          >
            <div className="p-4 border-b border-[#E5E5E5] bg-[#F9F9F9]">
              <p className="text-sm font-bold text-[#111111] truncate">{user.name}</p>
              <p className="text-xs font-mono text-[#666666] truncate">{user.email}</p>
            </div>

            <div className="p-2">
              <Link
                href="/profile"
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-[#666666] hover:text-[#111111] hover:bg-[#F2F2F2] rounded-md transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <User className="w-4 h-4" />
                MY PROFILE
              </Link>
              <Link
                href="/feed"
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-[#666666] hover:text-[#111111] hover:bg-[#F2F2F2] rounded-md transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <LayoutDashboard className="w-4 h-4" />
                DASHBOARD
              </Link>

              {/* ADMIN LINK */}
              {user.email && ["bharath.n@example.com", "n.bharath3430@gmail.com", "amazingakhil2006@gmail.com"].includes(user.email) && (
                <Link
                  href="/admin"
                  className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-md transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Shield className="w-4 h-4" />
                  ADMIN PANEL
                </Link>
              )}
            </div>

            <div className="p-2 border-t border-[#E5E5E5]">
              <a
                href="/auth/logout"
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4" />
                SIGN OUT
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
