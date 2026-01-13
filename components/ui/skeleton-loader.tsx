import { cn } from "@/lib/utils"

function Skeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-gray-200/50", className)}
            {...props}
        />
    )
}

export function CardSkeleton() {
    return (
        <div className="flex flex-col space-y-3">
            <Skeleton className="h-[125px] w-full rounded-xl" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
            </div>
        </div>
    )
}

export function FeedSkeleton() {
    return (
        <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
                <CardSkeleton key={i} />
            ))}
        </div>
    )
}

export { Skeleton }
