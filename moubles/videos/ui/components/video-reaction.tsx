import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ThumbsDownIcon, ThumbsUpIcon } from "lucide-react"
import { VideoGetOneOutput } from "../../type";
import {  useClerk } from "@clerk/nextjs";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";



interface videoReactionProps {
    videoId : string;
    likes : number;
    dislikes :number;
    viewerReaction : VideoGetOneOutput["viewerReaction"]
}

// TODO: implement video reactions
export const VideoReactions = ({
    videoId,
    likes,
    dislikes,
    viewerReaction
}:videoReactionProps) => {

    const clerk = useClerk();
    const utils = trpc.useUtils();
    const like = trpc.videoReactions.like.useMutation({
        onSuccess: () => {
            toast.success("success")
            utils.videos.getOne.invalidate({ id: videoId });
            // TODO : invaildate "liked " to playlist
        },
        onError: (error) => {
            toast.error("something went wrong")
            if (error.data?.code === "UNAUTHORIZED") {
                clerk.openSignIn();
            }
        }
    });
    const dislike = trpc.videoReactions.dislike.useMutation({
        onSuccess: () => {
            utils.videos.getOne.invalidate({ id: videoId });
        },
        onError: (error) => {
            if (error.data?.code === "UNAUTHORIZED") {
                clerk.openSignIn();
            }
        }
    });

    return (
        <div className="flex items-center flex-none">
            <Button
            className="rounded-l-full rounded-r-none gap-2 pr-4"
            variant="secondary"
            onClick={() => like.mutate({ videoId })}
            disabled={like.isPending || dislike.isPending}
            >
                <ThumbsUpIcon className={cn("size-5",viewerReaction === "like" && "fill-black" )}/>
                {likes}
            </Button>
            <Separator orientation="vertical" className="h-7"/>
            <Button
            variant="secondary"
            className="rounded-l-none rounded-r-full pl-3"
            onClick={() => dislike.mutate({ videoId })}
            disabled={like.isPending || dislike.isPending}
            >
                <ThumbsDownIcon className={cn("size-5",viewerReaction === "dislike" && "fill-black" )}/>
                {dislikes}
            </Button>
        </div>
    )
}