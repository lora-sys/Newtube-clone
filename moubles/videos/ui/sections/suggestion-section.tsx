"use client";

import { SUGGESTIONS_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import { VideoRowCard, VideoRowCardSkeleton } from "../components/video-row-card";
import { VideoGridCard, VideoGridCardSkeleton } from "../components/video-grid-card";
import { InfiniteScroll } from "@/components/ui/infinite";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "@/components/ui/error-boundary";

interface SuggestionSectionProps {
    videoId: string;
}

export const SuggestionSection = ({ videoId }: SuggestionSectionProps) => {
    return (
        <Suspense fallback={<SuggestionSectionSkeleton />}>
            <ErrorBoundary fallbackRender={({ error, resetErrorBoundary }) => (
                <ErrorFallback error={error} resetErrorBoundary={resetErrorBoundary} message="Failed to load suggestions" />
            )}>
                <SuggestionSectionSuspense videoId={videoId} />
            </ErrorBoundary>
        </Suspense>
    );
};

const SuggestionSectionSkeleton = () => {
    return (
        <>
            {/* Desktop skeleton */}
            <div className="space-y-3 hidden md:block">
                {Array.from({ length: 8 }).map((_, i) => (
                    <VideoRowCardSkeleton key={i} size="compact" />
                ))}
            </div>
            {/* Mobile skeleton */}
            <div className="block md:hidden space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <VideoGridCardSkeleton key={i} />
                ))}
            </div>
        </>
    );
};

const SuggestionSectionSuspense = ({ videoId }: SuggestionSectionProps) => {
    const [suggestions, query] = trpc.suggestions.getMany.useSuspenseInfiniteQuery(
        { videoId, limit: SUGGESTIONS_LIMIT },
        { getNextPageParam: (lastPage) => lastPage.nextCursor }
    );

    return (
        <>
            {/* Desktop: Row cards */}
            <div className="space-y-3 hidden md:block">
                {suggestions.pages
                    .flatMap((page) => page.items)
                    .map((video) => (
                        <VideoRowCard
                            key={video.id}
                            data={video}
                            size="compact"
                        />
                    ))}
                <InfiniteScroll
                    hasNextPage={query.hasNextPage}
                    isFetchingNeatPage={query.isFetchingNextPage}
                    fetchNextPage={query.fetchNextPage}
                />
            </div>
            
            {/* Mobile: Grid cards */}
            <div className="block md:hidden space-y-4">
                {suggestions.pages
                    .flatMap((page) => page.items)
                    .map((video) => (
                        <VideoGridCard
                            key={video.id}
                            data={video}
                        />
                    ))}
                <InfiniteScroll
                    hasNextPage={query.hasNextPage}
                    isFetchingNeatPage={query.isFetchingNextPage}
                    fetchNextPage={query.fetchNextPage}
                />
            </div>
        </>
    );
};