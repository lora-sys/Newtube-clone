import { trpc, HydrateClient } from "@/trpc/server";
import { WatchLaterSection } from "@/moubles/playlists/ui/sections/watch-later-section";
import { DEFAULT_LIMIT } from "@/constants";

export const dynamic = "force-dynamic";

const WatchLaterPage = async () => {
  void trpc.playlists.getWatchLater.prefetchInfinite({ limit: DEFAULT_LIMIT });

  return (
    <HydrateClient>
      <div className="max-w-[2400px] mx-auto mb-10 pt-2.5 flex flex-col gap-y-4 px-4">
        <h1 className="text-xl font-bold">Watch later</h1>
        <WatchLaterSection />
      </div>
    </HydrateClient>
  );
};

export default WatchLaterPage;
