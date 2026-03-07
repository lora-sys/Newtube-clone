"use client";

import { trpc } from "@/trpc/client";
import { ReplyItem } from "./reply-item";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { useState } from "react";

interface ReplySectionProps {
    parentId: string;
    videoId: string;
    replyCount: number;
    viewerId?: string;
}

export const ReplySection = ({
    parentId,
    videoId,
    replyCount,
    viewerId,
}: ReplySectionProps) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
        trpc.comments.getReplies.useInfiniteQuery(
            { parentId, limit: 5 },
            {
                getNextPageParam: (lastPage) => lastPage.nextCursor,
                enabled: isExpanded,
            }
        );

    const replies = data?.pages.flatMap((page) => page.items) ?? [];

    if (replyCount === 0) return null;

    return (
        <div className="mt-2">
            {!isExpanded ? (
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary font-medium hover:bg-primary/10"
                    onClick={() => setIsExpanded(true)}
                >
                    <ChevronDown className="size-4 mr-1" />
                    {replyCount} {replyCount === 1 ? "reply" : "replies"}
                </Button>
            ) : (
                <div className="space-y-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary font-medium hover:bg-primary/10"
                        onClick={() => setIsExpanded(false)}
                    >
                        <ChevronUp className="size-4 mr-1" />
                        {replyCount} {replyCount === 1 ? "reply" : "replies"}
                    </Button>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-4">
                            <Loader2 className="size-5 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {replies.map((reply) => (
                                <ReplyItem
                                    key={reply.id}
                                    id={reply.id}
                                    userId={reply.userId}
                                    value={reply.value}
                                    createAt={reply.createAt}
                                    user={reply.user}
                                    likeCount={reply.likeCount}
                                    dislikeCount={reply.dislikeCount}
                                    viewerReaction={reply.viewerReaction}
                                    videoId={videoId}
                                    viewerId={viewerId}
                                    parentId={parentId}
                                />
                            ))}
                            {hasNextPage && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-primary font-medium"
                                    onClick={() => fetchNextPage()}
                                    disabled={isFetchingNextPage}
                                >
                                    {isFetchingNextPage ? (
                                        <Loader2 className="size-4 mr-1 animate-spin" />
                                    ) : (
                                        <ChevronDown className="size-4 mr-1" />
                                    )}
                                    Show more replies
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
