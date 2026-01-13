import { FeedSkeleton } from "@/components/ui/skeleton-loader";
import { MatrixGrid } from "@/components/ui/matrix-grid";

export default function FeedLoading() {
    return (
        <div className="min-h-screen bg-black relative">
            <MatrixGrid />
            <div className="pt-24 md:pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="max-w-7xl mx-auto">
                    {/* Header Skeleton */}
                    <div className="mb-12 space-y-4">
                        <div className="h-6 w-32 bg-white/10 rounded animate-pulse" />
                        <div className="h-12 w-64 bg-white/10 rounded animate-pulse" />
                        <div className="h-6 w-96 bg-white/10 rounded animate-pulse" />
                    </div>

                    {/* Filter Skeleton */}
                    <div className="mb-12 h-16 w-full bg-white/5 rounded-2xl animate-pulse" />

                    <FeedSkeleton />
                </div>
            </div>
        </div>
    );
}
