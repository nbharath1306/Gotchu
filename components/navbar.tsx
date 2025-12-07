"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthButton } from "./auth-button";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/feed", label: "Feed" },
  { href: "/report/lost", label: "I Lost Something" },
  { href: "/report/found", label: "I Found Something" },
];

export function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out",
        isScrolled 
          ? "bg-white/80 backdrop-blur-md border-b border-slate-100 py-3" 
          : "bg-transparent py-5"
      )}
    >
      <nav className="max-w-5xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-teal-600/20 transition-transform group-hover:scale-105">
            G
          </div>
          <span className="font-bold text-xl text-slate-900 tracking-tight">Gotchu</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors",
                pathname === link.href 
                  ? "text-teal-600" 
                  : "text-slate-500 hover:text-slate-900"
              )}
            >
              {link.label}
            </Link>
          ))}
          <div className="pl-4 border-l border-slate-200">
            <AuthButton />
          </div>
        </div>

        {/* Mobile toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-slate-600"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-100 px-6 py-6 shadow-xl animate-in slide-in-from-top-5">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "text-base font-medium py-2 border-b border-slate-50",
                  pathname === link.href ? "text-teal-600" : "text-slate-600"
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2">
              <AuthButton />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
