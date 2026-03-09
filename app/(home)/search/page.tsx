import { trpc, HydrateClient } from "@/trpc/server";
import { SearchView } from "@/moubles/search/ui/views/search-view";
import { DEFAULT_LIMIT } from "@/constants";

export const dynamic = "force-dynamic";

interface SearchPageProps {
  searchParams: Promise<{ query?: string; categoryId?: string }>;
}

const SearchPage = async ({ searchParams }: SearchPageProps) => {
  const params = await searchParams;
  const query = params.query || "";
  const categoryId = params.categoryId;

  // 只有有搜索词才预加载
  if (query) {
    void trpc.search.getMany.prefetchInfinite({
      query,
      categoryId,
      limit: DEFAULT_LIMIT,
    });
  }

  return (
    <HydrateClient>
      <SearchView query={query} categoryId={categoryId} />
    </HydrateClient>
  );
};

export default SearchPage;
