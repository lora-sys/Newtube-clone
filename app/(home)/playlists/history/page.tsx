import { trpc, HydrateClient } from "@/trpc/server";
import { HistorySection } from "@/moubles/playlists/ui/sections/history-section";
import { DEFAULT_LIMIT } from "@/constants";

export const dynamic = "force-dynamic";

const HistoryPage = async () => {
  void trpc.playlists.getHistory.prefetchInfinite({ limit: DEFAULT_LIMIT });

  return (
    <HydrateClient>
      <div className="max-w-[2400px] mx-auto mb-10 pt-2.5 flex flex-col gap-y-4 px-4">
        <h1 className="text-xl font-bold">Watch history</h1>
        <HistorySection />
      </div>
    </HydrateClient>
  );
};

export default HistoryPage;
