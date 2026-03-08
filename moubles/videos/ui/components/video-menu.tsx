
"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVerticalIcon, ShareIcon, TrashIcon, ClockIcon, CheckIcon } from "lucide-react";
import { toast } from "sonner";
import { APP_URL } from "@/constants";
import { trpc } from "@/trpc/client";

interface VideoMenuProps {
    videoId: string;
    variant?: "ghost" | "secondary";
    onRemove?: () => void;
    /** 是否显示"添加到稍后观看"选项 */
    showWatchLater?: boolean;
    /** 是否已在稍后观看列表中（用于 Watch Later 页面显示移除选项） */
    isInWatchLater?: boolean;
    /** 从稍后观看移除后的回调 */
    onWatchLaterRemove?: () => void;
}

export const VideoMenu = ({
    videoId,
    onRemove,
    variant = "ghost",
    showWatchLater = true,
    isInWatchLater = false,
    onWatchLaterRemove,
}: VideoMenuProps) => {
    const utils = trpc.useUtils();

    // 添加到稍后观看
    const addToWatchLater = trpc.playlists.addToWatchLater.useMutation({
        onSuccess: () => {
            toast.success("Saved to Watch later");
            utils.playlists.getWatchLaterPreview.invalidate();
            utils.playlists.getWatchLater.invalidate();
        },
        onError: (error) => {
            if (error.message.includes("duplicate") || error.message.includes("unique")) {
                toast.info("Already in Watch later");
            } else {
                toast.error(`Failed to save: ${error.message}`);
            }
        },
    });

    // 从稍后观看移除
    const removeFromWatchLater = trpc.playlists.removeFromWatchLater.useMutation({
        onSuccess: () => {
            toast.success("Removed from Watch later");
            utils.playlists.getWatchLaterPreview.invalidate();
            utils.playlists.getWatchLater.invalidate();
            onWatchLaterRemove?.();
        },
        onError: (error) => {
            toast.error(`Failed to remove: ${error.message}`);
        },
    });

    const onShare = () => {
        const fullUrl = `${APP_URL}/videos/${videoId}`;
        navigator.clipboard.writeText(fullUrl);
        toast.success("Link copied to clipboard");
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant={variant} size="icon" className="rounded-full">
                    <MoreVerticalIcon />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onShare}>
                    <ShareIcon className="mr-2 size-4" />
                    Share
                </DropdownMenuItem>

                {showWatchLater && !isInWatchLater && (
                    <DropdownMenuItem
                        onClick={() => addToWatchLater.mutate({ videoId })}
                        disabled={addToWatchLater.isPending}
                    >
                        <ClockIcon className="mr-2 size-4" />
                        Save to Watch later
                    </DropdownMenuItem>
                )}

                {isInWatchLater && (
                    <DropdownMenuItem
                        onClick={() => removeFromWatchLater.mutate({ videoId })}
                        disabled={removeFromWatchLater.isPending}
                    >
                        <CheckIcon className="mr-2 size-4" />
                        Remove from Watch later
                    </DropdownMenuItem>
                )}

                {onRemove && (
                    <DropdownMenuItem
                        onClick={onRemove}
                        className="text-destructive focus:text-destructive"
                    >
                        <TrashIcon className="mr-2 size-4" />
                        Remove
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}