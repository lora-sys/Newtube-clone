"use client";

import { trpc } from "@/trpc/client";
import { InfiniteGrid, InfiniteGridWrapper } from "@/components/ui/infinite-grid";

interface VideoFeedSectionProps {
  categoryId?: string;
}

export const VideoFeedSection = ({ categoryId }: VideoFeedSectionProps) => {
  return (
    <InfiniteGridWrapper errorMessage="Failed to load videos">
      <VideoFeedSectionSuspense categoryId={categoryId} />
    </InfiniteGridWrapper>
  );
};

const VideoFeedSectionSuspense = ({ categoryId }: VideoFeedSectionProps) => {
  const [results, resultsQuery] = trpc.videos.getMany.useSuspenseInfiniteQuery(
    { limit: 12, categoryId },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  return (
    <InfiniteGrid
      data={results.pages.flatMap((page) => page.items)}
      hasNextPage={resultsQuery.hasNextPage}
      isFetchingNextPage={resultsQuery.isFetchingNextPage}
      fetchNextPage={resultsQuery.fetchNextPage}
      emptyMessage="No videos found"
      emptyDescription="Try adjusting your filters or check back later"
    />
  );
};
