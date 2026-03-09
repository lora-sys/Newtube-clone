"use client";

import { trpc } from "@/trpc/client";
import { InfiniteGrid, InfiniteGridWrapper } from "@/components/ui/infinite-grid";
import { DEFAULT_LIMIT } from "@/constants";

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
    { limit: DEFAULT_LIMIT, categoryId },
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
