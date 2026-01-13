"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface HolographicCardProps {
    children: ReactNode;
    className?: string;
    intensity?: "low" | "medium" | "high";
}

export function HolographicCard({ children, className }: HolographicCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
                "relative group rounded-2xl overflow-hidden backdrop-blur-xl border border-white/10",
                "bg-white/5 hover:bg-white/10 transition-colors duration-500",
                className
            )}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Holographic Border Glow */}
            <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10 group-hover:ring-white/20 transition-all duration-500" />

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>

            {/* Scaning Line Effect (Optional via CSS) */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent -translate-y-[100%] group-hover:translate-y-[100%] transition-transform duration-1000 ease-in-out pointer-events-none" />
        </motion.div>
    );
}
