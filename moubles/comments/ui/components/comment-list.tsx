"use client";

import { trpc } from "@/trpc/client";
import { CommentItem } from "./comment-item";
import { InfiniteScroll } from "@/components/ui/infinite";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "@/components/ui/error-boundary";
import { COMMENTS_LIMIT } from "@/constants";

interface CommentListProps {
    videoId: string;
}

export const CommentList = ({ videoId }: CommentListProps) => {
    return (
        <Suspense fallback={<CommentListSkeleton />}>
            <ErrorBoundary fallbackRender={({ error, resetErrorBoundary }) => (
                <ErrorFallback error={error} resetErrorBoundary={resetErrorBoundary} message="Failed to load comments" />
            )}>
                <CommentListSuspense videoId={videoId} />
            </ErrorBoundary>
        </Suspense>
    );
};

const CommentListSkeleton = () => {
    return (
        <div className="space-y-1">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-3 py-2">
                    <div className="size-10 rounded-full bg-muted animate-pulse shrink-0" />
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                            <div className="h-3 w-16 bg-muted animate-pulse rounded" />
                        </div>
                        <div className="space-y-1.5">
                            <div className="h-4 w-full bg-muted animate-pulse rounded" />
                            <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
                        </div>
                        <div className="flex items-center gap-1 mt-2">
                            <div className="h-6 w-10 bg-muted animate-pulse rounded-full" />
                            <div className="h-6 w-6 bg-muted animate-pulse rounded-full" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const CommentListSuspense = ({ videoId }: CommentListProps) => {
    const [comments, query] = trpc.comments.getMany.useSuspenseInfiniteQuery(
        { videoId, limit: COMMENTS_LIMIT },
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor,
        }
    );

    const viewerId = comments.pages[0]?.viewerId;

    return (
        <div className="space-y-1">
            {comments.pages
                .flatMap((page) => page.items)
                .map((comment) => (
                    <CommentItem
                        key={comment.id}
                        id={comment.id}
                        userId={comment.userId}
                        user={comment.user}
                        value={comment.value}
                        createAt={comment.createAt}
                        videoId={videoId}
                        viewerId={viewerId}
                        likeCount={comment.likeCount}
                        dislikeCount={comment.dislikeCount}
                        viewerReaction={comment.viewerReaction}
                        replyCount={comment.replyCount}
                    />
                ))}
            <InfiniteScroll
                hasNextPage={query.hasNextPage}
                isFetchingNeatPage={query.isFetchingNextPage}
                fetchNextPage={query.fetchNextPage}
            />
        </div>
    );
};
