import { cn } from "@/lib/utils";

interface NeonBadgeProps {
    children: React.ReactNode;
    variant?: "purple" | "emerald" | "amber" | "rose" | "blue" | "neutral";
    pulsing?: boolean;
    className?: string;
}

export function NeonBadge({ children, variant = "neutral", pulsing = false, className }: NeonBadgeProps) {
    const variants = {
        purple: "bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.2)]",
        emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(52,211,153,0.2)]",
        amber: "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(251,191,36,0.2)]",
        rose: "bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_10px_rgba(251,113,133,0.2)]",
        blue: "bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_10px_rgba(96,165,250,0.2)]",
        neutral: "bg-white/10 text-white/60 border-white/10",
    };

    return (
        <div className={cn(
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border backdrop-blur-md",
            variants[variant],
            pulsing && "animate-pulse",
            className
        )}>
            {pulsing && (
                <span className={cn(
                    "w-1.5 h-1.5 rounded-full mr-1.5",
                    variant === "purple" && "bg-purple-400 box-shadow-[0_0_8px_rgba(168,85,247,0.8)]",
                    variant === "emerald" && "bg-emerald-400 box-shadow-[0_0_8px_rgba(52,211,153,0.8)]",
                    variant === "amber" && "bg-amber-400 box-shadow-[0_0_8px_rgba(251,191,36,0.8)]",
                    variant === "rose" && "bg-rose-400 box-shadow-[0_0_8px_rgba(251,113,133,0.8)]",
                    variant === "blue" && "bg-blue-400 box-shadow-[0_0_8px_rgba(96,165,250,0.8)]",
                    variant === "neutral" && "bg-white/50"
                )} />
            )}
            {children}
        </div>
    );
}
