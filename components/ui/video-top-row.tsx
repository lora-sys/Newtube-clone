import { VideoGetOneOutput } from "@/moubles/videos/type"
import { VideoOwner } from "./video-owner"
import { VideoReactions } from "@/moubles/videos/ui/components/video-reaction"
import { VideoMenu } from "@/moubles/videos/ui/components/video-menu"
import { VideoDescription } from "@/moubles/videos/ui/components/video-description"
import { useMemo } from "react"
import { format, formatDistanceToNow } from "date-fns"

interface VideoTopRowProps {
    video: VideoGetOneOutput
}


export const VideoTopRow = ({ video }: VideoTopRowProps) => {

    const compactViews = useMemo(() => {
        return Intl.NumberFormat("en", {
            notation: "compact"

        }).format(video.videoCount);
    }, [video.videoCount]);

    const expandViews = useMemo(() => {
        return Intl.NumberFormat("en", {
            notation: "compact"

        }).format(video.videoCount);
    }, [video.videoCount]);

    const compactDate = useMemo(() => {
        return formatDistanceToNow(video.createAt, { addSuffix: true });
    }, [video.createAt])


    const expandedDate = useMemo(() => {
        return format(video.createAt, 'd MM yyyy');
    }, [video.createAt])

    return (
        <div className="flex flex-col gap-4 mt-4">
            <h1 className="text-xl font-medium">{video.title}</h1>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <VideoOwner 
                    user={video.user} 
                    videoId={video.id} 
                    subscriberCount={video.subscriberCount}
                    isSubscribed={video.isSubscribed > 0}
                />
                <div className="flex overflow-x-auto sm:min-w-[calc(50%-6px)] sm:justify-end sm:overflow-visible pb-2 -mb-2 sm:pb-0 gap-2">
                    <VideoReactions 
                    videoId = {video.id}
                    likes = {video.likeCount}
                    dislikes = {video.dislikeCount}
                    viewerReaction = {video.viewerReaction}
                    
                    />
                    <VideoMenu videoId={video.id} variant="secondary" />
                </div>
            </div>
            <VideoDescription
                compactViews={compactViews}
                expandedViews={expandViews}
                expandedDate={expandedDate}
                compactDate={compactDate}
                description={video.description}
            />
        </div>

    )


}