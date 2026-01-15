import { AuroraBackground } from "@/components/ui/aurora-background"

export default function Loading() {
    return (
        <AuroraBackground className="min-h-screen">
            <div className="flex items-center justify-center h-full relative z-10">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                    <p className="text-white/50 font-mono text-sm tracking-widest animate-pulse">ACQUIRING SIGNAL...</p>
                </div>
            </div>
        </AuroraBackground>
    )
}
