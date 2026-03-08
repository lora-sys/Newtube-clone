"use client";

import { useState } from "react";
import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useClerk, useUser } from "@clerk/nextjs";
import { UserAvatar } from "@/components/user-avatar";

interface ReplyFormProps {
    videoId: string;
    parentId: string;
    onCancel?: () => void;
}

export const ReplyForm = ({ videoId, parentId, onCancel }: ReplyFormProps) => {
    const [value, setValue] = useState("");
    const { user } = useUser();
    const clerk = useClerk();
    const utils = trpc.useUtils();

    const create = trpc.comments.create.useMutation({
        onSuccess: () => {
            setValue("");
            utils.comments.getReplies.invalidate({ parentId });
            utils.comments.getMany.invalidate();
            onCancel?.();
        },
        onError: (error) => {
            if (error.data?.code === "UNAUTHORIZED") {
                clerk.openSignIn();
            } else {
                toast.error("Something went wrong");
            }
        },
    });

    const handleSubmit = () => {
        if (!value.trim()) return;
        create.mutate({ videoId, value: value.trim(), parentId });
    };

    return (
        <div className="flex gap-3">
            {user && (
                <UserAvatar
                    imageurl={user.imageUrl}
                    name={user.fullName || "User"}
                    size="sm"
                    className="shrink-0"
                />
            )}
            <div className="flex-1">
                <Textarea
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Add a reply..."
                    className="min-h-[60px] resize-none border-none bg-transparent p-0 focus-visible:ring-0 text-sm"
                    rows={2}
                />
                {value.trim() && (
                    <div className="flex justify-end gap-2 mt-2">
                        {onCancel && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onCancel}
                            >
                                Cancel
                            </Button>
                        )}
                        <Button
                            size="sm"
                            onClick={handleSubmit}
                            disabled={create.isPending}
                        >
                            {create.isPending ? "Replying..." : "Reply"}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};
