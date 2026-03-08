"use client";

import { Suspense, useState } from "react";
import { UserAvatar } from "@/components/user-avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/trpc/client";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { BannerUploadModal } from "../components/banner-upload-modal";
import { CameraIcon } from "lucide-react";

interface UserChannelHeaderProps {
  userId: string;
}

export const UserChannelHeader = ({ userId }: UserChannelHeaderProps) => {
  return (
    <Suspense fallback={<UserChannelHeaderSkeleton />}>
      <UserChannelHeaderSuspense userId={userId} />
    </Suspense>
  );
};

const UserChannelHeaderSkeleton = () => (
  <div className="flex flex-col">
    <Skeleton className="w-full h-32 md:h-48" />
    <div className="flex items-center gap-4 p-4">
      <Skeleton className="size-20 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>
      <Skeleton className="h-9 w-24" />
    </div>
  </div>
);

const UserChannelHeaderSuspense = ({ userId }: UserChannelHeaderProps) => {
  const { userId: currentUserId } = useAuth();
  const [bannerModalOpen, setBannerModalOpen] = useState(false);

  const [user] = trpc.users.getOne.useSuspenseQuery({ id: userId });

  const isOwnChannel = currentUserId === user.clerkId;

  return (
    <div className="flex flex-col">
      {/* Banner */}
      <div className="relative w-full h-32 md:h-48 bg-gradient-to-r from-blue-600 to-purple-600 group">
        {user.bannerUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.bannerUrl}
            alt={`${user.name}'s banner`}
            className="w-full h-full object-cover"
          />
        )}
        {isOwnChannel && (
          <button
            onClick={() => setBannerModalOpen(true)}
            className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"
          >
            <div className="bg-black/60 text-white px-4 py-2 rounded-full flex items-center gap-2">
              <CameraIcon className="size-4" />
              <span className="text-sm font-medium">Change banner</span>
            </div>
          </button>
        )}
      </div>

      {/* Channel Info */}
      <div className="flex items-center gap-4 p-4">
        <UserAvatar
          imageurl={user.imageUrl}
          name={user.name}
          size="xl"
          className="size-20"
        />
        <div className="flex-1">
          <h1 className="text-xl font-bold">{user.name}</h1>
          <p className="text-sm text-muted-foreground">
            {user.subscriberCount.toLocaleString()} subscribers ·{" "}
            {user.videoCount.toLocaleString()} videos
          </p>
        </div>

        {isOwnChannel ? (
          <Button variant="secondary" asChild>
            <Link href="/studio">Customize channel</Link>
          </Button>
        ) : (
          <SubscribeButton userId={userId} />
        )}
      </div>

      {/* Banner Upload Modal */}
      <BannerUploadModal open={bannerModalOpen} onOpenChange={setBannerModalOpen} />
    </div>
  );
};

const SubscribeButton = ({ userId }: { userId: string }) => {
  const utils = trpc.useUtils();

  const [subscription] = trpc.subscriptions.check.useSuspenseQuery({
    creatorId: userId,
  });

  const subscribe = trpc.subscriptions.create.useMutation({
    onSuccess: () => {
      utils.subscriptions.check.invalidate({ creatorId: userId });
      utils.users.getOne.invalidate({ id: userId });
    },
  });

  const unsubscribe = trpc.subscriptions.remove.useMutation({
    onSuccess: () => {
      utils.subscriptions.check.invalidate({ creatorId: userId });
      utils.users.getOne.invalidate({ id: userId });
    },
  });

  if (subscription.isSubscribed) {
    return (
      <Button
        variant="secondary"
        onClick={() => unsubscribe.mutate({ creatorId: userId })}
        disabled={unsubscribe.isPending}
      >
        Subscribed
      </Button>
    );
  }

  return (
    <Button
      onClick={() => subscribe.mutate({ creatorId: userId })}
      disabled={subscribe.isPending}
    >
      Subscribe
    </Button>
  );
};
