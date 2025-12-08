"use client"

import { useState } from "react"
import { useUser } from "@auth0/nextjs-auth0/client"
import { useRouter } from "next/navigation"
import { Upload, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { submitReportAction } from "@/app/actions"

export default function ReportFound() {
  const { user, isLoading } = useUser()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  if (isLoading) return <div className="min-h-screen bg-[var(--bg-paper)]" />
  
  if (!user) {
    router.push("/auth/login")
    return null
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    formData.append("type", "FOUND")

    try {
      const result = await submitReportAction(formData)
      
      if (result.error) {
        throw new Error(result.error)
      }

      setSuccess(true)
      setTimeout(() => router.push("/feed"), 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-paper)] pt-24 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link 
          href="/"
          className="inline-flex items-center text-sm font-mono text-[var(--text-secondary)] hover:text-black mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          RETURN TO FEED
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-swiss p-8 md:p-12 bg-white"
        >
          <div className="mb-8 border-b border-[var(--border-default)] pb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
              <span className="font-mono text-xs font-bold text-blue-500 tracking-widest">REPORT TYPE: FOUND</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-[var(--text-primary)]">
              ITEM SECURED
            </h1>
            <p className="text-[var(--text-secondary)] mt-2">
              Submit details for a found item. Thank you for your honesty.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 flex items-center gap-3 text-sm font-mono">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          {success ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">REPORT FILED</h3>
              <p className="text-[var(--text-secondary)] font-mono text-sm">REDIRECTING TO DATABASE...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                    Item Name
                  </label>
                  <input
                    name="title"
                    required
                    placeholder="e.g. Blue Umbrella"
                    className="input-swiss w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                    Date Found
                  </label>
                  <input
                    name="date"
                    type="date"
                    required
                    className="input-swiss w-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  Location Zone
                </label>
                <select name="location" required className="input-swiss w-full">
                  <option value="">SELECT ZONE</option>
                  <option value="Innovation_Labs">INNOVATION LABS</option>
                  <option value="Canteen">CANTEEN</option>
                  <option value="Bus_Bay">BUS BAY</option>
                  <option value="Library">LIBRARY</option>
                  <option value="Hostels">HOSTELS</option>
                  <option value="Other">OTHER SECTOR</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  Description
                </label>
                <textarea
                  name="description"
                  required
                  rows={4}
                  placeholder="Provide distinguishing features, condition, or specific details..."
                  className="input-swiss w-full resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  Evidence (Image)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="border border-dashed border-[var(--border-default)] p-8 text-center hover:bg-[var(--bg-surface)] transition-colors">
                    <Upload className="w-6 h-6 mx-auto mb-2 text-[var(--text-secondary)]" />
                    <span className="text-sm font-mono text-[var(--text-secondary)]">
                      CLICK TO UPLOAD IMAGE
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-[var(--border-default)]">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-4 text-sm font-bold tracking-widest"
                >
                  {loading ? "PROCESSING..." : "SUBMIT REPORT"}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  )
}
