"use client";

import { trpc } from "@/trpc/client";
import { InfiniteGrid, InfiniteGridWrapper } from "@/components/ui/infinite-grid";
import { DEFAULT_LIMIT } from "@/constants";

interface UserVideosSectionProps {
  userId: string;
}

export const UserVideosSection = ({ userId }: UserVideosSectionProps) => {
  return (
    <InfiniteGridWrapper errorMessage="Failed to load videos">
      <UserVideosSectionSuspense userId={userId} />
    </InfiniteGridWrapper>
  );
};

const UserVideosSectionSuspense = ({ userId }: UserVideosSectionProps) => {
  const [results, resultsQuery] = trpc.videos.getMany.useSuspenseInfiniteQuery(
    { limit: DEFAULT_LIMIT, userId },
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
      emptyMessage="No videos yet"
      emptyDescription="This channel hasn't uploaded any videos"
    />
  );
};
