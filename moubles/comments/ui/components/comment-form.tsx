"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/user-avatar";
import { trpc } from "@/trpc/client";
import { useClerk, useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { useState } from "react";

interface CommentFormProps {
    videoId: string;
}

export const CommentForm = ({ videoId }: CommentFormProps) => {
    const clerk = useClerk();
    const { user } = useUser();
    const utils = trpc.useUtils();
    const [value, setValue] = useState("");

    const create = trpc.comments.create.useMutation({
        onSuccess: () => {
            toast.success("Comment added");
            setValue("");
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

    return (
        <form onSubmit={handleSubmit} className="flex gap-3 mb-6">
            <UserAvatar
                size="lg"
                imageurl={user?.imageUrl || "/user-placeholder.svg"}
                name={user?.fullName || "User"}
                className="shrink-0"
            />
            <div className="flex-1">
                <Textarea
                    placeholder="Add a comment..."
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="min-h-[60px] resize-none border-none bg-transparent focus-visible:ring-0 p-0 text-sm placeholder:text-muted-foreground"
                    disabled={create.isPending}
                />
                {value.trim() && (
                    <div className="flex justify-end gap-2 mt-2 pt-2 border-t">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setValue("")}
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
        </form>
    );
};
