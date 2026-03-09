import { trpc, HydrateClient } from "@/trpc/server";
import { PlaylistsSection } from "@/moubles/playlists/ui/sections/playlists-section";
import { SystemPlaylistCard, SystemPlaylistCardSkeleton } from "@/moubles/playlists/ui/components/system-playlist-card";
import { PlaylistCreateModal } from "@/moubles/playlists/ui/components/playlist-create-modal";
import { Suspense } from "react";
import { DEFAULT_LIMIT } from "@/constants";

export const dynamic = "force-dynamic";

const PlaylistsPage = async () => {
  void trpc.playlists.getMany.prefetchInfinite({ limit: DEFAULT_LIMIT });
  void trpc.playlists.getLikedPreview.prefetch();
  void trpc.playlists.getWatchLaterPreview.prefetch();

  return (
    <HydrateClient>
      <div className="max-w-[2400px] mx-auto mb-10 pt-2.5 flex flex-col gap-y-8 px-4">
        {/* System Playlists */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Playlists</h2>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <Suspense fallback={<SystemPlaylistCardSkeleton />}>
              <LikedPlaylistCard />
            </Suspense>
            <Suspense fallback={<SystemPlaylistCardSkeleton />}>
              <WatchLaterPlaylistCard />
            </Suspense>
          </div>
        </section>

        {/* User Playlists */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Created playlists</h2>
            <PlaylistCreateModal />
          </div>
          <PlaylistsSection />
        </section>
      </div>
    </HydrateClient>
  );
};

const LikedPlaylistCard = async () => {
  const liked = await trpc.playlists.getLikedPreview();
  return (
    <SystemPlaylistCard
      title="Liked videos"
      icon="liked"
      count={liked.count}
      thumbnails={liked.thumbnails}
      href="/playlists/liked"
    />
  );
};

const WatchLaterPlaylistCard = async () => {
  const watchLater = await trpc.playlists.getWatchLaterPreview();
  return (
    <SystemPlaylistCard
      title="Watch later"
      icon="watchLater"
      count={watchLater.count}
      thumbnails={watchLater.thumbnails}
      href="/playlists/watch-later"
    />
  );
};

export default PlaylistsPage;
