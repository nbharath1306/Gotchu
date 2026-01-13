import { Skeleton } from "@/components/ui/skeleton-loader";
import { MatrixGrid } from "@/components/ui/matrix-grid";

export default function ProfileLoading() {
    return (
        <div className="min-h-screen bg-black relative">
            <MatrixGrid />
            <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="max-w-4xl mx-auto space-y-8">
                    {/* Profile Header Skeleton */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md">
                        <div className="flex items-center gap-6">
                            <Skeleton className="w-24 h-24 rounded-full bg-white/10" />
                            <div className="space-y-4">
                                <Skeleton className="h-8 w-48 bg-white/10" />
                                <Skeleton className="h-4 w-32 bg-white/10" />
                            </div>
                        </div>
                    </div>

                    {/* Content Tabs Skeleton */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-96 animate-pulse">
                    </div>
                </div>
            </div>
        </div>
    );
}
