"use client";

import { UserAvatar } from "@/components/user-avatar";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { CommentReaction } from "./comment-reaction";
import { ReplyForm } from "./reply-form";
import { CommentMenu } from "./comment-menu";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { trpc } from "@/trpc/client";

interface ReplyItemProps {
    id: string;
    userId: string;
    value: string;
    createAt: Date;
    user: {
        id: string;
        name: string;
        imageUrl: string;
    };
    likeCount: number;
    dislikeCount: number;
    viewerReaction?: "like" | "dislike" | null;
    videoId: string;
    viewerId?: string;
    parentId: string;
}

export const ReplyItem = ({
    id,
    userId,
    value,
    createAt,
    user,
    likeCount,
    dislikeCount,
    viewerReaction,
    videoId,
    viewerId,
    parentId,
}: ReplyItemProps) => {
    const [isReplying, setIsReplying] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value);
    const utils = trpc.useUtils();

    const update = trpc.comments.update.useMutation({
        onSuccess: () => {
            toast.success("Reply updated");
            utils.comments.getReplies.invalidate({ parentId });
            setIsEditing(false);
        },
        onError: () => {
            toast.error("Something went wrong");
        },
    });

    const handleSave = () => {
        if (editValue.trim() === "") {
            toast.error("Reply cannot be empty");
            return;
        }
        update.mutate({ id, value: editValue });
    };

    const isOwner = viewerId === userId;

    return (
        <div className="flex gap-3 py-2 group">
            <UserAvatar
                imageurl={user.imageUrl}
                name={user.name}
                size="sm"
            />
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{user.name}</span>
                        <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(createAt, { addSuffix: true })}
                        </span>
                    </div>
                    {isOwner && !isEditing && (
                        <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <CommentMenu
                                commentId={id}
                                commentValue={value}
                                parentId={parentId}
                                onEdit={() => {
                                    setEditValue(value);
                                    setIsEditing(true);
                                }}
                            />
                        </div>
                    )}
                </div>
                {isEditing ? (
                    <div className="space-y-2 mt-2">
                        <Textarea
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="min-h-[60px] resize-none"
                            placeholder="Edit your reply..."
                        />
                        <div className="flex gap-2">
                            <Button size="sm" onClick={handleSave} disabled={update.isPending}>
                                Save
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)} disabled={update.isPending}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                ) : (
                    <>
                        <p className="text-sm mt-1">{value}</p>
                        <CommentReaction
                            commentId={id}
                            likes={likeCount}
                            dislikes={dislikeCount}
                            viewerReaction={viewerReaction}
                            onReply={() => setIsReplying(!isReplying)}
                        />
                        {isReplying && (
                            <div className="mt-2">
                                <ReplyForm
                                    videoId={videoId}
                                    parentId={id}
                                    onCancel={() => setIsReplying(false)}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
