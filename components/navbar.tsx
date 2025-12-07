"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import AuthButton from "@/components/auth-button"
import { Home, Search, PlusCircle, MessageSquare, Menu, User, X, Sparkles } from "lucide-react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

export function Navbar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const routes = [
    { href: "/", label: "Home", icon: Home },
    { href: "/feed", label: "Feed", icon: Search },
    { href: "/report/lost", label: "Lost", icon: PlusCircle },
    { href: "/report/found", label: "Found", icon: PlusCircle },
    { href: "/chat", label: "Messages", icon: MessageSquare },
    { href: "/profile", label: "Profile", icon: User },
  ]

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled 
            ? "bg-black/50 backdrop-blur-2xl border-b border-white/10 shadow-lg shadow-black/10" 
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex h-16 md:h-20 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-lg shadow-violet-500/25"
              >
                <Sparkles className="h-5 w-5 text-white" />
              </motion.div>
              <span className="text-xl font-black bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
                Gotchu
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {routes.map((route) => {
                const isActive = pathname === route.href
                return (
                  <Link key={route.href} href={route.href}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`relative px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 ${
                        isActive 
                          ? "text-white" 
                          : "text-muted-foreground hover:text-white"
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="navbar-active"
                          className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-pink-500/20 rounded-xl border border-violet-500/30"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-2">
                        <route.icon className="h-4 w-4" />
                        {route.label}
                      </span>
                    </motion.div>
                  </Link>
                )
              })}
            </nav>

            {/* Auth Button - Desktop */}
            <div className="hidden md:flex items-center gap-4">
              <AuthButton />
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            
            {/* Menu Content */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-b from-zinc-900 to-black border-l border-white/10 p-6 pt-24"
            >
              <nav className="flex flex-col gap-2">
                {routes.map((route, index) => {
                  const isActive = pathname === route.href
                  return (
                    <motion.div
                      key={route.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        href={route.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 ${
                          isActive
                            ? "bg-gradient-to-r from-violet-500/20 to-pink-500/20 border border-violet-500/30 text-white"
                            : "text-muted-foreground hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                          isActive 
                            ? "bg-gradient-to-br from-violet-500 to-pink-500" 
                            : "bg-white/10"
                        }`}>
                          <route.icon className="h-5 w-5" />
                        </div>
                        <span className="font-medium">{route.label}</span>
                      </Link>
                    </motion.div>
                  )
                })}
              </nav>

              <div className="mt-8 pt-8 border-t border-white/10">
                <AuthButton />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer for fixed navbar */}
      <div className="h-16 md:h-20" />
    </>
  )
}
