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
  { href: "/report/lost", label: "Report Lost" },
  { href: "/report/found", label: "Report Found" },
];

export function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled 
          ? "bg-white/80 backdrop-blur-xl border-b border-gray-200" 
          : "bg-transparent"
      )}
    >
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-bold text-xl text-gray-900">
          Gotchu
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors",
                pathname === link.href
                  ? "text-gray-900"
                  : "text-gray-500 hover:text-gray-900"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Auth */}
        <div className="hidden md:block">
          <AuthButton />
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "text-sm font-medium py-2",
                  pathname === link.href ? "text-gray-900" : "text-gray-500"
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-gray-100">
              <AuthButton />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
