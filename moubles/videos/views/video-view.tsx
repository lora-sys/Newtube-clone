import { CommentsSection } from "../ui/sections/comments-section";
import { SuggestionSection } from "../ui/sections/suggestion-section";
import VideoSection from "../ui/sections/video-section";

interface VideoViewProps {
    videoId: string;
}



const VideoView = ({ videoId }: VideoViewProps) => {
    return (
        <div className="flex flex-col max-w-[1700px] mx-auto pt-2.5 px-4 mb-10">
            <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 min-w-0 basis-0">
                    <VideoSection videoId={videoId} />
                    <div className="lg:hidden mt-4">
                        <SuggestionSection />
                    </div>
                    <CommentsSection videoId={videoId} />
                </div>
                <div className="hidden lg:block w-[380px] 2xl:w-[460px] shrink-0">
                    <SuggestionSection />
                </div>
            </div>
        </div>
    );
};


export default VideoView;