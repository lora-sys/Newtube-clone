import VideoView from "@/moubles/videos/views/video-view";
import { HydrateClient, trpc } from "@/trpc/server";
import { COMMENTS_LIMIT, SUGGESTIONS_LIMIT } from "@/constants";

interface PageProps {
    params: Promise<{
        videoId: string;
    }>;
}

const Page = async ({ params }: PageProps) => {
    const { videoId } = await params;

    void trpc.videos.getOne.prefetch({ id: videoId });
    void trpc.comments.getMany.prefetchInfinite({ videoId, limit: COMMENTS_LIMIT });
    void trpc.suggestions.getMany.prefetchInfinite({ videoId, limit: SUGGESTIONS_LIMIT });

    return (
        <HydrateClient>
            <VideoView videoId={videoId} />
        </HydrateClient>
    );
};

export default Page;