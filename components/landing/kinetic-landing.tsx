"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Search, Shield, Zap, User, LogIn } from "lucide-react";
import Link from "next/link";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { TextReveal } from "@/components/ui/text-reveal";
import { MagneticButton } from "@/components/ui/magnetic-button";

export function KineticLanding({ stats, session }: { stats: any, session: any }) {
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 200]);
    const opacity = useTransform(scrollY, [0, 300], [1, 0]);

    return (
        <AuroraBackground className="min-h-screen overflow-x-hidden selection:bg-purple-500/30">
            {/* Sticky Nav */}
            <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-6">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-md border border-white/10">
                            <Zap className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-bold text-white tracking-wider">GOTCHU</span>
                    </div>

                    <div className="flex items-center gap-4">
                        {session ? (
                            <Link href="/profile">
                                <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors backdrop-blur-md group cursor-pointer">
                                    {session.user?.picture ? (
                                        <img
                                            src={session.user.picture}
                                            alt="Profile"
                                            className="w-6 h-6 rounded-full border border-white/20"
                                        />
                                    ) : (
                                        <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300 group-hover:bg-indigo-500/30">
                                            <User className="w-3 h-3" />
                                        </div>
                                    )}
                                    <span className="text-sm text-white/80 group-hover:text-white font-medium">Profile</span>
                                </div>
                            </Link>
                        ) : (
                            <Link href="/login">
                                <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors backdrop-blur-md group cursor-pointer">
                                    <LogIn className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" />
                                    <span className="text-sm text-white/60 group-hover:text-white transition-colors">Log In</span>
                                </div>
                            </Link>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-20 z-10">
                <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md"
                    >
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-mono text-white/60 tracking-widest uppercase">System Online • {stats.activeReports} Active Signals</span>
                    </motion.div>

                    <div className="flex justify-center">
                        <TextReveal
                            text="Gotchu."
                            className="text-6xl md:text-9xl font-display font-medium text-white tracking-tighter leading-none"
                            gradient
                        />
                    </div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-xl md:text-2xl text-white/40 max-w-2xl mx-auto font-light leading-relaxed"
                    >
                        The high-frequency recovery network for DSU.
                        <br />
                        <span className="text-white/80">Don't just report it. Broadcast it.</span>
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="flex flex-col md:flex-row items-center justify-center gap-4 mt-12"
                    >
                        <MagneticButton intensity={0.3}>
                            <Link href="/report/lost" className="group relative w-full md:w-64 h-24 block">
                                <div className="absolute inset-0 bg-white/5 border border-white/10 rounded-2xl group-hover:bg-red-500/10 group-hover:border-red-500/30 transition-all duration-500" />
                                <div className="relative h-full flex items-center justify-between px-8">
                                    <div className="text-left">
                                        <div className="text-xs font-mono text-red-400 uppercase tracking-widest mb-1">Panic Mode</div>
                                        <div className="text-2xl font-display text-white">I Lost It</div>
                                    </div>
                                    <ArrowRight className="text-red-400 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </Link>
                        </MagneticButton>

                        <MagneticButton intensity={0.3}>
                            <Link href="/report/found" className="group relative w-full md:w-64 h-24 block">
                                <div className="absolute inset-0 bg-white/5 border border-white/10 rounded-2xl group-hover:bg-emerald-500/10 group-hover:border-emerald-500/30 transition-all duration-500" />
                                <div className="relative h-full flex items-center justify-between px-8">
                                    <div className="text-left">
                                        <div className="text-xs font-mono text-emerald-400 uppercase tracking-widest mb-1">Hero Mode</div>
                                        <div className="text-2xl font-display text-white">I Found It</div>
                                    </div>
                                    <ArrowRight className="text-emerald-400 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </Link>
                        </MagneticButton>
                    </motion.div>
                </div>
            </section>

            {/* Live Feed Teaser */}
            <section className="py-32 px-4 border-t border-white/5 bg-black/50 relative z-10 backdrop-blur-sm">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between mb-12">
                        <h2 className="text-3xl font-display text-white">Live Signals</h2>
                        <Link href="/feed" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm font-mono uppercase tracking-widest">
                            View Full Network <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="glass-panel p-8 rounded-2xl">
                            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6 text-purple-400">
                                <Zap className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-display text-white mb-2">Instant Broadcast</h3>
                            <p className="text-white/40">Alerts hit the network in &lt;12ms. Everyone nearby knows immediately.</p>
                        </div>

                        {/* Feature 2 */}
                        <div className="glass-panel p-8 rounded-2xl">
                            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6 text-emerald-400">
                                <Shield className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-display text-white mb-2">Secure Recovery</h3>
                            <p className="text-white/40">Identity-verified claims. Protocol-enforced handovers. Zero friction.</p>
                        </div>

                        {/* Feature 3 */}
                        <div className="glass-panel p-8 rounded-2xl">
                            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 text-blue-400">
                                <Search className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-display text-white mb-2">Neural Match</h3>
                            <p className="text-white/40">Our engine automatically pairs lost reports with found items. Magic.</p>
                        </div>
                    </div>
                </div>
            </section>
        </AuroraBackground>
    );
}
