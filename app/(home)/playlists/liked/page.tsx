import { trpc, HydrateClient } from "@/trpc/server";
import { LikedSection } from "@/moubles/playlists/ui/sections/liked-section";

export const dynamic = "force-dynamic";

const LikedPage = async () => {
  void trpc.playlists.getLiked.prefetchInfinite({ limit: 12 });

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
