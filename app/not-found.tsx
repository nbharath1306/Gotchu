import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { AuroraBackground } from "@/components/ui/aurora-background"
import { MagneticButton } from "@/components/ui/magnetic-button"

export default function NotFound() {
    return (
        <AuroraBackground className="min-h-screen">
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 relative z-10">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-8 border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                    <AlertCircle className="w-10 h-10 text-white/40" />
                </div>

                <h2 className="text-4xl md:text-5xl font-display font-medium text-white mb-4">
                    Signal Lost
                </h2>

                <p className="text-white/40 max-w-md mx-auto mb-10 text-lg leading-relaxed">
                    The frequency you are looking for does not exist or has faded from the network.
                </p>

                <Link href="/">
                    <MagneticButton className="px-10 py-4 bg-white text-black font-medium rounded-full hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-white/10">
                        Return to Signal
                    </MagneticButton>
                </Link>
            </div>
        </AuroraBackground>
    )
}
