"use client";

import React from "react";
// Remove "framer-motion" import as we are using "framer-motion" from "framer-motion" package which is already installed.
// Wait, I should import from "framer-motion".
import { motion } from "framer-motion";
import { Spotlight } from "@/components/ui/spotlight";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { ArrowRight, Search, Zap, Shield, Radio } from "lucide-react";
import Link from "next/link";

interface Stats {
    activeReports: number;
    recoveredCount?: number;
    totalUsers?: number;
}

interface Session {
    user?: {
        name?: string;
        picture?: string;
    };
}

export function AuraHero({ stats, session }: { stats: Stats; session: Session | null }) {
    return (
        <div className="min-h-screen w-full rounded-md flex flex-col md:items-center md:justify-center bg-black/[0.96] antialiased bg-grid-white/[0.02] relative overflow-hidden">
            <Spotlight
                className="-top-40 left-0 md:left-60 md:-top-20"
                fill="white"
            />

            <div className="p-4 max-w-7xl mx-auto relative z-10 w-full pt-20 md:pt-0">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    className="text-center"
                >
                    <h1 className="text-4xl md:text-7xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 bg-opacity-50">
                        Gotchu. <br /> The Recovery Network.
                    </h1>
                    <p className="mt-4 font-normal text-base text-neutral-300 max-w-lg text-center mx-auto">
                        The high-frequency, decentralized lost & found protocol for DSU.
                        Broadcast your signal. We handle the rest.
                    </p>

                    <div className="mt-8 flex justify-center gap-4">
                        <Link href="/report/lost" className="inline-flex h-12 animate-shimmer items-center justify-center rounded-md border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
                            Broadcast Lost Signal
                        </Link>
                        <Link href="/report/found" className="px-8 py-3 rounded-md bg-white text-black font-bold transition hover:bg-neutral-200">
                            I Found Something
                        </Link>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="mt-20"
                >
                    <BentoGrid className="max-w-4xl mx-auto">
                        <BentoGridItem
                            title="Live Network"
                            description={`${stats.activeReports} Active Signals broadcasting right now.`}
                            header={<div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800" />}
                            icon={<Radio className="h-4 w-4 text-neutral-500" />}
                            className="md:col-span-2"
                        />
                        <BentoGridItem
                            title="Instant Match"
                            description="Neural engine matches items in <12ms."
                            header={<div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800" />}
                            icon={<Zap className="h-4 w-4 text-neutral-500" />}
                            className="md:col-span-1"
                        />
                        <BentoGridItem
                            title="Secure Handover"
                            description="Verified identity protocol."
                            header={<div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800" />}
                            icon={<Shield className="h-4 w-4 text-neutral-500" />}
                            className="md:col-span-1"
                        />
                        <BentoGridItem
                            title="Community Powered"
                            description={`${stats.totalUsers || '500+'} Students connected.`}
                            header={<div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800" />}
                            icon={<Search className="h-4 w-4 text-neutral-500" />}
                            className="md:col-span-2"
                        />
                    </BentoGrid>
                </motion.div>
            </div>
        </div>
    );
}
