import { Skeleton } from "@/components/ui/skeleton"

export const VideoTopRowSkeleton = () => {
    return (
        <div className="flex flex-col gap-4 mt-4">
            <Skeleton className="h-7 w-3/4" />
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex items-center sm:items-start justify-between sm:justify-start gap-3 min-w-0">
                    <div className="flex items-center gap-3 min-w-0">
                        <Skeleton className="size-10 rounded-full" />
                        <div className="flex flex-col min-w-0 gap-1">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-16" />
                        </div>
                    </div>
                    <Skeleton className="h-9 w-24 rounded-full" />
                </div>
                <div className="flex overflow-x-auto sm:min-w-[calc(50%-6px)] sm:justify-end sm:overflow-visible pb-2 -mb-2 sm:pb-0 gap-2">
                    <Skeleton className="h-9 w-20 rounded-l-full" />
                    <Skeleton className="h-9 w-12 rounded-r-full" />
                    <Skeleton className="h-9 w-8 rounded-full" />
                </div>
            </div>
            <div className="bg-secondary/50 rounded-xl p-3">
                <div className="flex gap-2 text-sm mb-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-24 mt-4" />
            </div>
        </div>
    )
}
