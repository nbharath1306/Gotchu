"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import AuthButton from "@/components/auth-button"
import { Home, Search, PlusCircle, MessageSquare, Menu } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useState } from "react"

export function Navbar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const routes = [
    {
      href: "/",
      label: "Home",
      icon: Home,
      active: pathname === "/",
    },
    {
      href: "/feed",
      label: "Feed",
      icon: Search,
      active: pathname === "/feed",
    },
    {
      href: "/report/lost",
      label: "Report Lost",
      icon: PlusCircle,
      active: pathname === "/report/lost",
    },
    {
      href: "/report/found",
      label: "Report Found",
      icon: PlusCircle,
      active: pathname === "/report/found",
    },
    {
      href: "/chat",
      label: "Messages",
      icon: MessageSquare,
      active: pathname === "/chat",
    },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 glass">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2 font-bold text-xl">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-gradient font-extrabold text-2xl tracking-tight">Gotchu</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={`transition-all duration-200 hover:text-violet-500 ${
                route.active ? "text-violet-600 font-semibold" : "text-muted-foreground"
              }`}
            >
              {route.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <AuthButton />
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-4">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] glass border-l border-white/10">
              <nav className="flex flex-col gap-4 mt-8">
                {routes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 text-lg font-medium transition-colors p-2 rounded-lg hover:bg-white/5 ${
                      route.active ? "text-violet-600 bg-violet-500/10" : "text-muted-foreground"
                    }`}
                  >
                    <route.icon className="h-5 w-5" />
                    {route.label}
                  </Link>
                ))}
                <div className="mt-4 pt-4 border-t border-white/10">
                  <AuthButton />
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
