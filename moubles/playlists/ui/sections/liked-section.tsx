"use client";

import { trpc } from "@/trpc/client";
import { InfiniteGrid, InfiniteGridWrapper } from "@/components/ui/infinite-grid";

export const LikedSection = () => {
  return (
    <InfiniteGridWrapper errorMessage="Failed to load liked videos">
      <LikedSectionSuspense />
    </InfiniteGridWrapper>
  );
};

const LikedSectionSuspense = () => {
  const [results, resultsQuery] = trpc.playlists.getLiked.useSuspenseInfiniteQuery(
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
      emptyMessage="No liked videos"
      emptyDescription="Videos you like will appear here"
    />
  );
};
