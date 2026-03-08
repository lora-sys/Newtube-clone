"use client";

import { trpc } from "@/trpc/client";
import { InfiniteGrid, InfiniteGridWrapper } from "@/components/ui/infinite-grid";

export const HistorySection = () => {
  return (
    <InfiniteGridWrapper errorMessage="Failed to load history">
      <HistorySectionSuspense />
    </InfiniteGridWrapper>
  );
};

const HistorySectionSuspense = () => {
  const [results, resultsQuery] = trpc.playlists.getHistory.useSuspenseInfiniteQuery(
    { limit: 12 },
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
      emptyMessage="No watch history"
      emptyDescription="Videos you watch will appear here"
    />
  );
};
