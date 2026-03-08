"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "@/components/ui/error-boundary";
import { trpc } from "@/trpc/client";
import { CommentForm } from "@/moubles/comments/ui/components/comment-form";
import { CommentList } from "@/moubles/comments/ui/components/comment-list";
import { Skeleton } from "@/components/ui/skeleton";
import { COMMENTS_LIMIT } from "@/constants";

interface CommentsSectionProps {
    videoId: string;
}

export const CommentsSection = ({ videoId }: CommentsSectionProps) => {
    return (
        <Suspense fallback={<CommentsSectionSkeleton />}>
            <ErrorBoundary fallbackRender={({ error, resetErrorBoundary }) => (
                <ErrorFallback error={error} resetErrorBoundary={resetErrorBoundary} message="Failed to load comments" />
            )}>
                <CommentsSectionSuspense videoId={videoId} />
            </ErrorBoundary>
        </Suspense>
    );
};

const CommentsSectionSkeleton = () => {
    return (
        <div className="mt-6">
            <Skeleton className="h-6 w-32 mb-6" />
            {/* Comment Form Skeleton */}
            <div className="flex gap-3 mb-6">
                <Skeleton className="size-10 rounded-full shrink-0" />
                <div className="flex-1">
                    <div className="h-5 w-full" />
                </div>
            </div>
            {/* Comment List Skeleton */}
            <div className="space-y-1">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex gap-3 py-2">
                        <Skeleton className="size-10 rounded-full shrink-0" />
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-3 w-16" />
                            </div>
                            <div className="space-y-1.5">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-2/3" />
                            </div>
                            <div className="flex items-center gap-1 mt-2">
                                <Skeleton className="h-6 w-10 rounded-full" />
                                <Skeleton className="h-6 w-6 rounded-full" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const CommentsSectionSuspense = ({ videoId }: CommentsSectionProps) => {
    const [data] = trpc.comments.getMany.useSuspenseInfiniteQuery(
        { videoId, limit: COMMENTS_LIMIT },
        { getNextPageParam: (lastPage) => lastPage.nextCursor }
    );

    const commentCount = data.pages.reduce((acc, page) => acc + page.items.length, 0);

    return (
        <div className="mt-6">
            <h2 className="text-lg font-medium mb-6">
                {commentCount} Comments
            </h2>
            <CommentForm videoId={videoId} />
            <CommentList videoId={videoId} />
        </div>
    );
};