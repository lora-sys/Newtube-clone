import { trpc, HydrateClient } from "@/trpc/server";
import { LikedSection } from "@/moubles/playlists/ui/sections/liked-section";
import { DEFAULT_LIMIT } from "@/constants";

export const dynamic = "force-dynamic";

const LikedPage = async () => {
  void trpc.playlists.getLiked.prefetchInfinite({ limit: DEFAULT_LIMIT });

  return (
    <HydrateClient>
      <div className="max-w-[2400px] mx-auto mb-10 pt-2.5 flex flex-col gap-y-4 px-4">
        <h1 className="text-xl font-bold">Liked videos</h1>
        <LikedSection />
      </div>
    </HydrateClient>
  );
};

export default LikedPage;
