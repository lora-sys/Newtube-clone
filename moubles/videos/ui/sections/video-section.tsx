
"use client";

import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "@/components/ui/error-boundary";
import { VideoPlayer, VideoPlayerSkeleton } from "../components/video-player";
import { VideoBanner } from "@/components/ui/video-banner";
import { VideoTopRow, VideoTopRowSkeleton } from "@/components/ui/video-top-row";
import { useAuth } from "@clerk/nextjs";

interface VideoSectionProps {
    videoId : string;
}


export const VideoSection = ({videoId} : VideoSectionProps) => {
return (
    <Suspense fallback={<VideoSectionSkeleton/>}>
        <ErrorBoundary fallbackRender={({ error, resetErrorBoundary }) => (
            <ErrorFallback error={error} resetErrorBoundary={resetErrorBoundary} message="Failed to load video" />
        )}>
            <VideoSectionSuspense videoId={videoId}/>
        </ErrorBoundary>
    </Suspense>
)

}

const VideoSectionSkeleton = () => {
    return (
        <>
         <VideoPlayerSkeleton/>
         <VideoTopRowSkeleton/>
        </>
    )
}

const VideoSectionSuspense = ({videoId} : VideoSectionProps) => {

const utils = trpc.useUtils();
const {isSignedIn} = useAuth();
const [video] = trpc.videos.getOne.useSuspenseQuery({id : videoId})
const createViews = trpc.videoViews.create.useMutation({
    onSuccess : ()=> {
        utils.videos.getOne.invalidate({
            id : videoId
        });
    }
});
const handlePlay = () => {
    if(!isSignedIn) {
        return;
    }
    createViews.mutate({videoId})
}

return (
    <>
        <div
            className={cn(
                "aspect-video bg-black rounded-xl overflow-hidden relative",
                video.muxStatus !== "ready" && "rounded-b-none"
            )}
        >
            <VideoPlayer
                autoPlay
                onPlay={handlePlay}
                playbackId={video.muxPlaybackId}
                thumbnailUrl={video.thumbnailurl} />

        </div>
        <VideoBanner status={video.muxStatus} />
        <VideoTopRow video={video}/>
        </>
)

}


export default VideoSection