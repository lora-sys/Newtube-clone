"use client";

import { trpc } from "@/trpc/client";
import { InfiniteGrid, InfiniteGridWrapper } from "@/components/ui/infinite-grid";

export const WatchLaterSection = () => {
  return (
    <InfiniteGridWrapper errorMessage="Failed to load watch later">
      <WatchLaterSectionSuspense />
    </InfiniteGridWrapper>
  );
};

const WatchLaterSectionSuspense = () => {
  const utils = trpc.useUtils();
  
  const [results, resultsQuery] = trpc.playlists.getWatchLater.useSuspenseInfiniteQuery(
    { limit: 12 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  const handleRemove = async (videoId: string) => {
    // 刷新列表
    await utils.playlists.getWatchLater.invalidate();
  };

  return (
    <InfiniteGrid
      data={results.pages.flatMap((page) => page.items)}
      hasNextPage={resultsQuery.hasNextPage}
      isFetchingNextPage={resultsQuery.isFetchingNextPage}
      fetchNextPage={resultsQuery.fetchNextPage}
      emptyMessage="No videos in watch later"
      emptyDescription="Videos you save for later will appear here"
      isInWatchLater={true}
      onWatchLaterRemove={handleRemove}
    />
  );
};
