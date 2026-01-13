"use client"

import { AuroraBackground } from "@/components/ui/aurora-background"
// import { TextReveal } from "@/components/ui/text-reveal" // Unused
import { MagneticButton } from "@/components/ui/magnetic-button"
import { ArrowLeft, ShieldCheck } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  return (
    <AuroraBackground className="min-h-[100dvh] flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-sm md:max-w-md space-y-6 md:space-y-8 relative z-10">

        {/* Header */}
        <div className="text-center space-y-4 md:space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md shadow-[0_0_40px_rgba(255,255,255,0.1)]">
              <ShieldCheck className="w-8 h-8 md:w-10 md:h-10 text-white" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-display font-medium text-white tracking-tighter px-2">
              Welcome Back
            </h1>
            <p className="text-white/40 font-light text-base md:text-lg max-w-[80%] mx-auto">
              Sign in to manage your signals and activity.
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="glass-panel p-6 md:p-8 rounded-3xl space-y-6 border border-white/10 bg-white/5 backdrop-blur-xl">
          <MagneticButton className="w-full">
            <Link
              href="/api/auth/login"
              className="w-full block py-3.5 md:py-4 bg-white text-black text-center font-medium rounded-xl hover:bg-slate-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)] text-sm md:text-base active:scale-95 transform duration-100"
            >
              Log In / Sign Up
            </Link>
          </MagneticButton>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-[10px] md:text-xs uppercase tracking-widest">
              <span className="bg-transparent px-2 text-white/20 font-mono">
                Secure Access
              </span>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm py-2"
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
