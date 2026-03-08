
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/user-avatar";
import { UserInfo } from "@/moubles/users/ui/components/user-info";
import { VideoMenu } from "./video-menu";
import { VideoThumbnail } from "./video-thumbnail";
import { VideoGetManyutput } from "../../type";

interface VideoGridCardProps {
    data: VideoGetManyutput["items"][number];
    onRemove?: () => void;
    /** 是否在稍后观看列表中 */
    isInWatchLater?: boolean;
    /** 从稍后观看移除后的回调 */
    onWatchLaterRemove?: () => void;
}

export const VideoGridCardSkeleton = () => {
    return (
        <div className="group">
            <Skeleton className="aspect-video rounded-lg w-full" />
            <div className="flex gap-3 mt-3">
                <Skeleton className="size-10 rounded-full shrink-0" />
                <div className="flex-1 min-w-0">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-3 w-3/4 mb-1" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
            </div>
        </div>
    );
};

export const VideoGridCard = ({
    data,
    onRemove,
    isInWatchLater = false,
    onWatchLaterRemove,
}: VideoGridCardProps) => {
    const compactViews = useMemo(() => {
        return Intl.NumberFormat("en", {
            notation: "compact",
        }).format(data.viewCount);
    }, [data.viewCount]);

    const compactLikes = useMemo(() => {
        return Intl.NumberFormat("en", {
            notation: "compact",
        }).format(data.likeCount);
    }, [data.likeCount]);

    const relativeTime = useMemo(() => {
        return formatDistanceToNow(data.createAt, { addSuffix: true });
    }, [data.createAt]);

    return (
        <div className="group">
            {/* Thumbnail */}
            <Link href={`/videos/${data.id}`}>
                <VideoThumbnail
                    imageurl={data.thumbnailurl}
                    previewUrl={data.previewUrl}
                    title={data.title}
                    duration={data.duration || 0}
                    muxPlaybackId={data.muxPlaybackId}
                />
            </Link>

            {/* Info */}
            <div className="flex gap-3 mt-3">
                <Link href={`/videos/${data.id}`} className="shrink-0">
                    <UserAvatar
                        size="default"
                        imageurl={data.user.imageUrl ?? ""}
                        name={data.user.name}
                    />
                </Link>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-x-2">
                        <Link href={`/videos/${data.id}`} className="flex-1 min-w-0">
                            <h3 className="font-medium line-clamp-2 group-hover:text-primary transition-colors">
                                {data.title}
                            </h3>
                        </Link>
                        <div className="shrink-0">
                            <VideoMenu 
                                videoId={data.id} 
                                onRemove={onRemove}
                                isInWatchLater={isInWatchLater}
                                onWatchLaterRemove={onWatchLaterRemove}
                            />
                        </div>
                    </div>

                    <UserInfo size="sm" name={data.user.name} />

                    <p className="text-xs text-muted-foreground mt-0.5">
                        {compactViews} views · {compactLikes} likes · {relativeTime}
                    </p>
                </div>
            </div>
        </div>
    );
};