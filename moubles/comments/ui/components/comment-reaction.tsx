"use client";

import { cn } from "@/lib/utils";
import { ThumbsDownIcon, ThumbsUpIcon } from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";

interface CommentReactionProps {
    commentId: string;
    likes: number;
    dislikes: number;
    viewerReaction?: "like" | "dislike" | null;
}

export const CommentReaction = ({
    commentId,
    likes,
    dislikes,
    viewerReaction,
}: CommentReactionProps) => {
    const clerk = useClerk();
    const utils = trpc.useUtils();

    const like = trpc.commentReactions.like.useMutation({
        onSuccess: () => {
            utils.comments.getMany.invalidate();
        },
        onError: (error) => {
            toast.error("Something went wrong");
            if (error.data?.code === "UNAUTHORIZED") {
                clerk.openSignIn();
            }
        },
    });

    const dislike = trpc.commentReactions.dislike.useMutation({
        onSuccess: () => {
            utils.comments.getMany.invalidate();
        },
        onError: (error) => {
            toast.error("Something went wrong");
            if (error.data?.code === "UNAUTHORIZED") {
                clerk.openSignIn();
            }
        },
    });

    return (
        <div className="flex items-center gap-1 mt-1">
            <button
                className={cn(
                    "flex items-center gap-1 px-2 py-1 text-xs rounded-full transition-colors",
                    viewerReaction === "like"
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
                onClick={() => like.mutate({ commentId })}
                disabled={like.isPending || dislike.isPending}
            >
                <ThumbsUpIcon className={cn(
                    "size-3.5",
                    viewerReaction === "like" && "fill-current"
                )} />
                {likes > 0 && <span>{likes}</span>}
            </button>
            <button
                className={cn(
                    "flex items-center gap-1 px-2 py-1 text-xs rounded-full transition-colors",
                    viewerReaction === "dislike"
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
                onClick={() => dislike.mutate({ commentId })}
                disabled={like.isPending || dislike.isPending}
            >
                <ThumbsDownIcon className={cn(
                    "size-3.5",
                    viewerReaction === "dislike" && "fill-current"
                )} />
                {dislikes > 0 && <span>{dislikes}</span>}
            </button>
        </div>
    );
};
