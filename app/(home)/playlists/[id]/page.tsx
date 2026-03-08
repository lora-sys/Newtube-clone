import { trpc, HydrateClient } from "@/trpc/server";
import { notFound } from "next/navigation";
import { PlaylistDetailSection } from "@/moubles/playlists/ui/sections/playlist-detail-section";

export const dynamic = "force-dynamic";

interface PlaylistDetailPageProps {
  params: Promise<{ id: string }>;
}

const PlaylistDetailPage = async ({ params }: PlaylistDetailPageProps) => {
  const { id } = await params;

  try {
    void trpc.playlists.getOne.prefetch({ id });

    return (
      <HydrateClient>
        <div className="max-w-[2400px] mx-auto mb-10 pt-2.5 flex flex-col gap-y-4 px-4">
          <PlaylistDetailSection playlistId={id} />
        </div>
      </HydrateClient>
    );
  } catch {
    notFound();
  }
};

export default PlaylistDetailPage;
