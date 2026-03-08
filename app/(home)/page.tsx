import { trpc, HydrateClient } from "@/trpc/server";
import { HomeView } from "@/moubles/home/ui/views/home-vew";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ categoryId?: string }>;
}

const Page = async ({ searchParams }: PageProps) => {
  const params = await searchParams;
  const categoryId = params.categoryId;

  void trpc.categories.getMany.prefetch();
  void trpc.videos.getMany.prefetchInfinite({ categoryId, limit: 12 });

  return (
    <HydrateClient>
      <HomeView categoryId={categoryId} />
    </HydrateClient>
  );
};

export default Page;
