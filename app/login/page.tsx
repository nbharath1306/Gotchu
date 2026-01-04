"use client"

import { AuroraBackground } from "@/components/ui/aurora-background"
import { TextReveal } from "@/components/ui/text-reveal"
import { MagneticButton } from "@/components/ui/magnetic-button"
import { ArrowLeft, ShieldCheck } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  return (
    <AuroraBackground className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 relative z-10">

        {/* Header */}
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md shadow-[0_0_40px_rgba(255,255,255,0.1)]">
              <ShieldCheck className="w-10 h-10 text-white" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-display font-medium text-white tracking-tighter">
              Welcome Back
            </h1>
            <p className="text-white/40 font-light text-lg">
              Sign in to manage your signals and activity.
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="glass-panel p-8 rounded-3xl space-y-6">
          <MagneticButton>
            <a
              href="/api/auth/login"
              className="w-full block py-4 bg-white text-black text-center font-medium rounded-xl hover:bg-slate-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
              Log In / Sign Up
            </a>
          </MagneticButton>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest">
              <span className="bg-transparent px-2 text-white/20 font-mono">
                Secure Access
              </span>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Dashboard
            </Link>
          </div>
        </div>

      </div>
    </AuroraBackground>
  )
}
