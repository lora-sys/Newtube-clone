import { trpc, HydrateClient } from "@/trpc/server";
import { UserChannelHeader } from "@/moubles/users/ui/sections/user-channel-header";
import { UserVideosSection } from "@/moubles/users/ui/sections/user-videos-section";
import { DEFAULT_LIMIT } from "@/constants";
import { notFound } from "next/navigation";


export const dynamic = "force-dynamic";

interface UserPageProps {
  params: Promise<{ userId: string }>;
}

const UserPage = async ({ params }: UserPageProps) => {
  const { userId } = await params;

  try {
    void trpc.users.getOne.prefetch({ id: userId });
    void trpc.videos.getMany.prefetchInfinite({ limit: DEFAULT_LIMIT, userId });
    void trpc.subscriptions.check.prefetch({ creatorId: userId });

    return (
      <HydrateClient>
        <div className="max-w-[2400px] mx-auto mb-10 flex flex-col gap-y-6">
          <UserChannelHeader userId={userId} />
          <div className="px-4">
            <h2 className="text-lg font-semibold mb-4">Videos</h2>
            <UserVideosSection userId={userId} />
          </div>
        </div>
      </HydrateClient>
    );
  } catch {
    notFound();
  }
};

export default UserPage;
