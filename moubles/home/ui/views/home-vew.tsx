import { CategoriesSection } from "../section/categories-section";
import { VideoFeedSection } from "@/moubles/videos/ui/sections/video-feed-section";

interface HomeViewProps {
  categoryId?: string;
}

export const HomeView = ({ categoryId }: HomeViewProps) => {
  return (
    <div className="max-w-[2400px] mx-auto mb-10 pt-2.5 flex flex-col gap-y-6 px-4">
      <CategoriesSection categoryId={categoryId} />
      <VideoFeedSection categoryId={categoryId} />
    </div>
  );
};
