import { trpc, HydrateClient } from "@/trpc/server";
import { TrendingSection } from "@/moubles/videos/ui/sections/trending-section";
import { CategoriesSection } from "@/moubles/home/ui/section/categories-section";

export const dynamic = "force-dynamic";

interface TrendingPageProps {
  searchParams: Promise<{ categoryId?: string }>;
}

const TrendingPage = async ({ searchParams }: TrendingPageProps) => {
  const { categoryId } = await searchParams;

  void trpc.videos.getTrending.prefetchInfinite({ limit: 12, categoryId });

  return (
    <HydrateClient>
      <div className="max-w-[2400px] mx-auto mb-10 pt-2.5 flex flex-col gap-y-6 px-4">
        <CategoriesSection categoryId={categoryId} />
        <TrendingSection categoryId={categoryId} />
      </div>
    </HydrateClient>
  );
};

export default TrendingPage;
