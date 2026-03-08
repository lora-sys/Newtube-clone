"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/user-avatar";
import { trpc } from "@/trpc/client";
import { useClerk, useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { useState, useRef } from "react";

interface CommentFormProps {
    videoId: string;
}

export const CommentForm = ({ videoId }: CommentFormProps) => {
    const clerk = useClerk();
    const { user } = useUser();
    const utils = trpc.useUtils();
    const [value, setValue] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const create = trpc.comments.create.useMutation({
        onSuccess: () => {
            toast.success("Comment added");
            setValue("");
            setIsFocused(false);
            utils.comments.getMany.invalidate({ videoId });
        },
        onError: (error) => {
            if (error.data?.code === "UNAUTHORIZED") {
                clerk.openSignIn();
            } else {
                toast.error("Something went wrong");
            }
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!value.trim()) return;
        create.mutate({ videoId, value });
    };

    const handleCancel = () => {
        setValue("");
        setIsFocused(false);
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-3 mb-6">
            <UserAvatar
                size="lg"
                imageurl={user?.imageUrl || "/user-placeholder.svg"}
                name={user?.fullName || "User"}
                className="shrink-0"
            />
            <div className="flex-1">
                <div className={`rounded-lg border overflow-hidden transition-colors ${isFocused ? "border-blue-500" : "border-gray-300"}`}>
                    <Textarea
                        ref={textareaRef}
                        placeholder="Add a comment..."
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => {
                            if (!value.trim()) {
                                setIsFocused(false);
                            }
                        }}
                        className="min-h-[80px] resize-none border-none bg-transparent focus-visible:ring-0 p-3 text-sm placeholder:text-muted-foreground"
                        disabled={create.isPending}
                    />
                    {isFocused && (
                        <div className="flex justify-end gap-2 p-2 pt-1 bg-gray-50">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleCancel}
                                disabled={create.isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                size="sm"
                                disabled={create.isPending || !value.trim()}
                            >
                                {create.isPending ? "Commenting..." : "Comment"}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </form>
    );
};
