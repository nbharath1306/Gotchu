"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthButton } from "./auth-button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { href: "/feed", label: "Feed" },
  { href: "/report/lost", label: "Lost" },
  { href: "/report/found", label: "Found" },
];

export function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none"
      >
        <nav 
          className={cn(
            "pointer-events-auto flex items-center justify-between gap-8 px-6 py-3 rounded-full transition-all duration-500 ease-out",
            isScrolled || mobileOpen
              ? "bg-white/90 backdrop-blur-xl border border-slate-200/50 shadow-xl shadow-slate-900/5 w-full max-w-5xl" 
              : "bg-white/50 backdrop-blur-md border border-white/40 shadow-lg shadow-slate-900/5 w-full max-w-4xl"
          )}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-600 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-teal-900/20 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
              G
              <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="font-bold text-lg text-slate-900 tracking-tight hidden sm:block">Gotchu</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1 bg-slate-100/50 p-1 rounded-full border border-slate-200/50">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-300",
                    isActive 
                      ? "text-teal-700 bg-white shadow-sm" 
                      : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-4 shrink-0">
            <AuthButton />
          </div>

          {/* Mobile Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-slate-600 hover:bg-slate-100 rounded-full"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </nav>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed top-24 left-4 right-4 z-40 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-2xl p-6 md:hidden origin-top"
          >
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-2xl transition-colors",
                    pathname === link.href 
                      ? "bg-teal-50 text-teal-700 font-semibold" 
                      : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  {link.label}
                  {pathname === link.href && <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />}
                </Link>
              ))}
              <div className="h-px bg-slate-100 my-2" />
              <div className="px-2">
                <AuthButton />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
