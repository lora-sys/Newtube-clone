"use client";

import { UserAvatar } from "@/components/user-avatar";
import { trpc } from "@/trpc/client";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { CommentMenu } from "./comment-menu";
import { CommentReaction } from "./comment-reaction";
import { ReplySection } from "./reply-section";
import { ReplyForm } from "./reply-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cva, type VariantProps } from "class-variance-authority";

const commentItemVariants = cva("group py-2", {
    variants: {
        variant: {
            default: "",
            reply: "",
        },
    },
    defaultVariants: {
        variant: "default",
    },
});

interface CommentItemProps extends VariantProps<typeof commentItemVariants> {
    id: string;
    userId: string;
    user: {
        id: string;
        name: string;
        imageUrl: string;
    };
    value: string;
    createAt: Date;
    videoId: string;
    viewerId?: string;
    likeCount: number;
    dislikeCount: number;
    viewerReaction?: "like" | "dislike" | null;
    replyCount?: number;
    parentId?: string;
}

export const CommentItem = ({
    id,
    userId,
    user,
    value,
    createAt,
    videoId,
    viewerId,
    likeCount,
    dislikeCount,
    viewerReaction,
    replyCount,
    parentId,
    variant = "default",
}: CommentItemProps) => {
    const utils = trpc.useUtils();
    const [isEditing, setIsEditing] = useState(false);
    const [isReplying, setIsReplying] = useState(false);
    const [editValue, setEditValue] = useState(value);

    const isReply = variant === "reply";
    const isOwner = viewerId === userId;

    const update = trpc.comments.update.useMutation({
        onSuccess: () => {
            toast.success(isReply ? "Reply updated" : "Comment updated");
            // 根据变体决定刷新哪个缓存
            if (isReply && parentId) {
                utils.comments.getReplies.invalidate({ parentId });
            } else {
                utils.comments.getMany.invalidate({ videoId });
            }
            setIsEditing(false);
        },
        onError: () => {
            toast.error("Something went wrong");
        },
    });

    const handleEdit = () => {
        setIsEditing(true);
        setEditValue(value);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditValue(value);
    };

    const handleSave = () => {
        if (editValue.trim() === "") {
            toast.error(isReply ? "Reply cannot be empty" : "Comment cannot be empty");
            return;
        }
        update.mutate({ id, value: editValue });
    };

    return (
        <div className={commentItemVariants({ variant })}>
            <div className="flex gap-3">
                <UserAvatar
                    size={isReply ? "sm" : "lg"}
                    imageurl={user.imageUrl}
                    name={user.name}
                    className="shrink-0"
                />
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{user.name}</span>
                            <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(createAt, { addSuffix: true })}
                            </span>
                        </div>
                        {isOwner && !isEditing && (
                            <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <CommentMenu
                                    commentId={id}
                                    commentValue={value}
                                    parentId={isReply ? parentId : undefined}
                                    onEdit={handleEdit}
                                />
                            </div>
                        )}
                    </div>
                    {isEditing ? (
                        <div className="space-y-2 mt-2">
                            <Textarea
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="min-h-[80px] resize-none"
                                placeholder={isReply ? "Edit your reply..." : "Edit your comment..."}
                            />
                            <div className="flex gap-2">
                                <Button size="sm" onClick={handleSave} disabled={update.isPending}>
                                    Save
                                </Button>
                                <Button size="sm" variant="ghost" onClick={handleCancel} disabled={update.isPending}>
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-1">
                            <p className="text-sm whitespace-pre-wrap break-words">{value}</p>
                            <CommentReaction
                                commentId={id}
                                likes={likeCount}
                                dislikes={dislikeCount}
                                viewerReaction={viewerReaction}
                                onReply={() => setIsReplying(!isReplying)}
                            />
                        </div>
                    )}
                    {isReplying && !isEditing && (
                        <div className="mt-3 ml-2">
                            <ReplyForm
                                videoId={videoId}
                                parentId={id}
                                onCancel={() => setIsReplying(false)}
                            />
                        </div>
                    )}
                </div>
            </div>
            {/* Reply section - only for default variant (top-level comments) */}
            {!isReply && replyCount !== undefined && (
                <div className="ml-12">
                    <ReplySection
                        parentId={id}
                        videoId={videoId}
                        replyCount={replyCount}
                        viewerId={viewerId}
                    />
                </div>
            )}
        </div>
    );
};