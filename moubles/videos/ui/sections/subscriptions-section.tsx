"use client";

import { trpc } from "@/trpc/client";
import { InfiniteGrid, InfiniteGridWrapper } from "@/components/ui/infinite-grid";

export const SubscriptionsSection = () => {
  return (
    <InfiniteGridWrapper errorMessage="Failed to load subscriptions">
      <SubscriptionsSectionSuspense />
    </InfiniteGridWrapper>
  );
};

const SubscriptionsSectionSuspense = () => {
  const [results, resultsQuery] = trpc.videos.getSubscriptions.useSuspenseInfiniteQuery(
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
      emptyMessage="No subscriptions yet"
      emptyDescription="Subscribe to creators to see their videos here"
    />
  );
};
