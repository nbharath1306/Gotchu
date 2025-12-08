"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { 
  ArrowRight,
  ArrowUpRight,
  Search,
  Radio,
  Shield,
  CheckCircle2,
  Users,
  Clock,
  Trophy
} from "lucide-react"

// Stagger animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

// Stats Component
function Stats() {
  const stats = [
    { value: "500+", label: "ITEMS RETURNED", icon: CheckCircle2 },
    { value: "2.5K", label: "ACTIVE USERS", icon: Users },
    { value: "<24h", label: "AVG RETURN TIME", icon: Clock },
    { value: "98%", label: "SUCCESS RATE", icon: Trophy },
  ]
  
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          variants={itemVariants}
          className="card-swiss p-6 md:p-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <stat.icon className="h-4 w-4 text-[var(--text-secondary)]" strokeWidth={2} />
            <span className="label-caps">{stat.label}</span>
          </div>
          <div className="number-display text-4xl md:text-5xl text-[var(--text-primary)]">
            {stat.value}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// Feature Card
function FeatureCard({ 
  number,
  title, 
  description,
}: { 
  number: string
  title: string
  description: string
}) {
  return (
    <motion.div
      variants={itemVariants}
      className="card-swiss p-8 group"
    >
      <span className="label-caps text-[var(--accent-alert)] mb-4 block">{number}</span>
      <h3 className="text-xl font-display font-bold text-[var(--text-primary)] mb-3 tracking-tight">
        {title}
      </h3>
      <p className="text-[var(--text-secondary)] leading-relaxed">
        {description}
      </p>
    </motion.div>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--bg-paper)]">
      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg-paper)]/80 backdrop-blur-xl border-b border-[var(--border-default)]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-display text-xl font-bold tracking-tight">GOTCHU</span>
            <span className="pill-tag">BETA</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/feed" className="text-sm font-medium hover:text-[var(--accent-blue)] transition-colors">Live Feed</Link>
          </div>
        </div>
      </header>

      <main className="pt-32 pb-20 px-6">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto"
        >
          {/* Hero Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-32">
            <div className="lg:col-span-8">
              <motion.div variants={itemVariants} className="mb-8">
                <span className="pill-tag mb-4 inline-block">CAMPUS PROTOCOL V2</span>
                <h1 className="text-6xl md:text-8xl font-display font-bold tracking-tighter leading-[0.9] mb-8 text-[var(--text-primary)]">
                  LOST & FOUND<br />
                  REIMAGINED.
                </h1>
                <p className="text-xl md:text-2xl text-[var(--text-secondary)] max-w-2xl leading-relaxed font-light">
                  A decentralized recovery system for the modern campus. 
                  Report items instantly. Track status in real-time.
                </p>
              </motion.div>

              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
                <Link href="/report/lost">
                  <button className="btn-primary w-full sm:w-auto group">
                    REPORT LOST ITEM
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
                <Link href="/report/found">
                  <button className="btn-outline w-full sm:w-auto">
                    I FOUND SOMETHING
                  </button>
                </Link>
              </motion.div>
            </div>

            <div className="lg:col-span-4 flex flex-col justify-end">
              <motion.div variants={itemVariants} className="card-swiss p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="label-caps">SYSTEM STATUS</span>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[var(--accent-success)] rounded-full animate-pulse"></span>
                    <span className="text-xs font-mono">OPERATIONAL</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-[var(--border-default)]">
                    <span className="text-sm font-medium">Active Reports</span>
                    <span className="font-mono">124</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-[var(--border-default)]">
                    <span className="text-sm font-medium">Recovered Today</span>
                    <span className="font-mono">12</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm font-medium">Avg. Response</span>
                    <span className="font-mono">~12m</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-32">
            <FeatureCard 
              number="01"
              title="INSTANT LOGGING"
              description="Submit reports in seconds with our streamlined interface. Categorize, describe, and upload."
            />
            <FeatureCard 
              number="02"
              title="SMART MATCHING"
              description="Our system automatically cross-references lost reports with found items to suggest matches."
            />
            <FeatureCard 
              number="03"
              title="SECURE HANDOFF"
              description="Verify ownership and coordinate safe returns through our secure messaging protocol."
            />
          </div>

          {/* CTA Section */}
          <motion.div 
            variants={itemVariants}
            className="bg-[var(--text-primary)] text-white p-12 md:p-24 rounded-none relative overflow-hidden"
          >
            <div className="relative z-10 max-w-3xl">
              <h2 className="text-4xl md:text-6xl font-display font-bold mb-6 tracking-tight">
                READY TO RECOVER?
              </h2>
              <p className="text-lg text-gray-400 mb-8 max-w-xl">
                Join thousands of students using Gotchu to keep their belongings safe.
              </p>
              <Link href="/feed">
                <button className="bg-white text-black px-8 py-4 font-bold tracking-tight hover:bg-[var(--accent-blue)] hover:text-white transition-colors duration-300 flex items-center gap-2">
                  BROWSE LIVE FEED
                  <ArrowUpRight className="w-5 h-5" />
                </button>
              </Link>
            </div>
            
            {/* Abstract Grid Decoration */}
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
              <div className="w-full h-full grid grid-cols-6 grid-rows-6">
                {[...Array(36)].map((_, i) => (
                  <div key={i} className="border border-white/20" />
                ))}
              </div>
            </div>
          </motion.div>

        </motion.div>
      </main>
    </div>
  )
}
