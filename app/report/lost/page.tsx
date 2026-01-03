"use client"

import { ReportWizard } from "@/components/report-wizard"
import { useUser } from "@auth0/nextjs-auth0/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function ReportLost() {
  const { user, isLoading } = useUser()
  const router = useRouter()

  if (isLoading) return <div className="min-h-screen bg-[#F2F2F2]" />

  if (!user) {
    router.push("/auth/login")
    return null
  }

  return (
    <div className="min-h-screen bg-[#F2F2F2] pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-mono text-[#666666] hover:text-black mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          RETURN TO FEED
        </Link>

        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 bg-red-100 text-red-600 rounded-full">
            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
            <span className="font-mono text-[10px] font-bold tracking-widest uppercase">Recovery Mode</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-[#111111] mb-4">
            Let's find your item.
          </h1>
          <p className="text-[#666666] text-lg max-w-xl mx-auto">
            Don't worry. Our community protocols are designed to help you recover lost valuables quickly. Just answer a few questions.
          </p>
        </div>

        {/* Wizard Component */}
        <ReportWizard type="LOST" />

      </div>
    </div>
  )
}
