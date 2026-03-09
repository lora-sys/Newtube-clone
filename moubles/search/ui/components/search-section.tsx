"use client";

import { trpc } from "@/trpc/client";
import { InfiniteGrid, InfiniteGridWrapper } from "@/components/ui/infinite-grid";
import { DEFAULT_LIMIT } from "@/constants";

interface SearchSectionProps {
  query: string;
  categoryId?: string;
}

export const SearchSection = ({ query, categoryId }: SearchSectionProps) => {
  return (
    <InfiniteGridWrapper errorMessage="Failed to search videos">
      <SearchSectionSuspense query={query} categoryId={categoryId} />
    </InfiniteGridWrapper>
  );
};

const SearchSectionSuspense = ({ query, categoryId }: SearchSectionProps) => {
  const [results, resultsQuery] = trpc.search.getMany.useSuspenseInfiniteQuery(
    { query, limit: DEFAULT_LIMIT, categoryId },
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
      emptyDescription={`No results for "${query}"`}
    />
  );
};
