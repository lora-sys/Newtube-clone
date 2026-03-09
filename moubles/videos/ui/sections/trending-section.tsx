"use client";

import { trpc } from "@/trpc/client";
import { InfiniteGrid, InfiniteGridWrapper } from "@/components/ui/infinite-grid";
import { DEFAULT_LIMIT } from "@/constants";

interface TrendingSectionProps {
  categoryId?: string;
}

export const TrendingSection = ({ categoryId }: TrendingSectionProps) => {
  return (
    <InfiniteGridWrapper errorMessage="Failed to load trending videos">
      <TrendingSectionSuspense categoryId={categoryId} />
    </InfiniteGridWrapper>
  );
};

const TrendingSectionSuspense = ({ categoryId }: TrendingSectionProps) => {
  const [results, resultsQuery] = trpc.videos.getTrending.useSuspenseInfiniteQuery(
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
      emptyMessage="No trending videos"
      emptyDescription="Check back later for trending content"
    />
  );
};
