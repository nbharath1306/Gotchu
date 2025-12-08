"use client"

import { ArrowLeft, ShieldCheck } from "lucide-react"
import Link from "next/link"

export default function Login() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F2F2F2] text-[#111111] font-sans selection:bg-[#FF4F4F] selection:text-white">
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-[#FF4F4F] rounded-none flex items-center justify-center mb-6 border-2 border-[#111111] shadow-[4px_4px_0px_0px_#111111]">
              <ShieldCheck className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-4xl font-bold tracking-tighter uppercase mb-2">
              Welcome Back
            </h2>
            <p className="text-[#666666] font-mono text-sm">
              Sign in to access the secure network
            </p>
          </div>

          <div className="bg-white p-8 border-2 border-[#111111] shadow-[8px_8px_0px_0px_#111111]">
            <div className="space-y-6">
              <a
                href="/api/auth/login"
                className="w-full flex justify-center py-4 px-4 border-2 border-[#111111] text-sm font-bold uppercase tracking-wider text-white bg-[#111111] hover:bg-[#FF4F4F] hover:border-[#FF4F4F] transition-all duration-200 shadow-[4px_4px_0px_0px_#666666] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
              >
                Sign in with SSO
              </a>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-[#111111]/10" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-[#666666] font-mono">
                    SECURE ACCESS
                  </span>
                </div>
              </div>

              <div className="text-center">
                <Link 
                  href="/"
                  className="inline-flex items-center text-sm font-bold text-[#111111] hover:text-[#FF4F4F] transition-colors uppercase tracking-wide"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Command Center
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
