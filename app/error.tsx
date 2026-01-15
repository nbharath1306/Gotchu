'use client'

import { useEffect } from 'react'
import { AuroraBackground } from "@/components/ui/aurora-background"
import { MagneticButton } from "@/components/ui/magnetic-button"
import { AlertTriangle, RefreshCcw } from 'lucide-react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <AuroraBackground className="min-h-screen">
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 relative z-10">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-8 border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                    <AlertTriangle className="w-10 h-10 text-red-500/80" />
                </div>

                <h2 className="text-4xl font-display font-medium text-white mb-4">
                    System Malfunction
                </h2>

                <p className="text-white/40 max-w-md mx-auto mb-2 text-sm font-mono">
                    Error Digest: {error.digest || "Unknown"}
                </p>

                <p className="text-white/60 max-w-md mx-auto mb-10 text-lg leading-relaxed">
                    We encountered an unexpected anomaly. Our systems have been notified.
                </p>

                <div className="flex gap-4">
                    <MagneticButton
                        onClick={() => reset()}
                        className="px-8 py-3 bg-white text-black font-medium rounded-full hover:scale-105 active:scale-95 transition-transform flex items-center gap-2"
                    >
                        <RefreshCcw className="w-4 h-4" />
                        Retry Connection
                    </MagneticButton>

                    <MagneticButton
                        onClick={() => window.location.href = '/'}
                        className="px-8 py-3 bg-white/10 text-white font-medium rounded-full hover:bg-white/20 transition-all"
                    >
                        Return Home
                    </MagneticButton>
                </div>
            </div>
        </AuroraBackground>
    )
}
