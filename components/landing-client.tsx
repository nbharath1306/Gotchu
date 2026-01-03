"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { AuthButton } from "@/components/auth-button"
import {
    ArrowRight,
    ArrowUpRight,
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

interface LandingPageProps {
    stats: {
        activeReports: number;
        recoveredCount: number;
        avgResponse: string;
        totalUsers: number;
    }
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
            <span className="label-caps text-[#FF3B30] mb-4 block">{number}</span>
            <h3 className="text-xl font-display font-bold text-[#111111] mb-3 tracking-tight">
                {title}
            </h3>
            <p className="text-[#666666] leading-relaxed">
                {description}
            </p>
        </motion.div>
    )
}

export function LandingPageClient({ stats }: LandingPageProps) {
    return (
        <div className="min-h-screen bg-[var(--bg-paper)]">
            {/* Top Bar */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-[#F2F2F2]/80 backdrop-blur-xl border-b border-[#E5E5E5]">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <span className="font-display text-xl font-bold tracking-tight text-[#111111]">GOTCHU</span>
                        <span className="pill-tag">BETA</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link href="/feed" className="text-sm font-medium text-[#111111] hover:text-[#0055FF] transition-colors">Live Feed</Link>
                        <AuthButton />
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
                                <span className="pill-tag mb-4 inline-block">CAMPUS RECOVERY NETWORK</span>
                                <h1 className="text-6xl md:text-8xl font-display font-bold tracking-tighter leading-[0.9] mb-8 text-[#111111]">
                                    LOST & FOUND<br />
                                    REIMAGINED.
                                </h1>
                                <p className="text-xl md:text-2xl text-[#666666] max-w-2xl leading-relaxed font-light">
                                    A community-powered network to help you find what matters.
                                    We search, match, and connect you instantly.
                                </p>
                            </motion.div>

                            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
                                <Link href="/report/lost">
                                    <button className="btn-primary w-full sm:w-auto group">
                                        I LOST SOMETHING
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
                                    <span className="label-caps">COMMUNITY ACTIVITY</span>
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 bg-[var(--accent-success)] rounded-full animate-pulse"></span>
                                        <span className="text-xs font-mono">ACTIVE SCAN</span>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center py-3 border-b border-[var(--border-default)]">
                                        <span className="text-sm font-medium">Items Being Tracked</span>
                                        <span className="font-mono text-lg font-bold">{stats.activeReports}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-b border-[var(--border-default)]">
                                        <span className="text-sm font-medium">Successfully Returned</span>
                                        <span className="font-mono text-lg font-bold text-green-600">{stats.recoveredCount}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-b border-[var(--border-default)]">
                                        <span className="text-sm font-medium">Helpers Online</span>
                                        <span className="font-mono text-lg font-bold">{stats.totalUsers}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2">
                                        <span className="text-sm font-medium">Avg. Response</span>
                                        <span className="font-mono text-gray-500">{stats.avgResponse}</span>
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
                        className="bg-[#111111] text-white p-12 md:p-24 rounded-none relative overflow-hidden"
                    >
                        <div className="relative z-10 max-w-3xl">
                            <h2 className="text-4xl md:text-6xl font-display font-bold mb-6 tracking-tight text-white">
                                WE'VE GOT YOU.
                            </h2>
                            <p className="text-lg text-gray-400 mb-8 max-w-xl">
                                Join {stats.totalUsers > 1 ? stats.totalUsers : "thousands of"} students helping each other keep safe. Your item is likely already found.
                            </p>
                            <Link href="/feed">
                                <button className="bg-white text-[#111111] px-8 py-4 font-bold tracking-tight hover:bg-[#0055FF] hover:text-white transition-colors duration-300 flex items-center gap-2">
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
