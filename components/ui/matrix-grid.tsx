"use client";

import { cn } from "@/lib/utils";

export function MatrixGrid({ className }: { className?: string }) {
    return (
        <div className={cn("absolute inset-0 z-0 pointer-events-none overflow-hidden", className)}>
            {/* Grid Pattern */}
            <div
                className="absolute inset-0 opacity-[0.2]"
                style={{
                    backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
                    backgroundSize: '40px 40px',
                    maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)'
                }}
            />

            {/* Moving Horizon Line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent animate-scan-slow opacity-50" />
        </div>
    );
}
