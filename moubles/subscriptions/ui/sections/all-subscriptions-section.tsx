"use client";

import { trpc } from "@/trpc/client";
import { UserLink } from "@/moubles/users/ui/components/user-link";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth, useClerk } from "@clerk/nextjs";
import { ErrorBoundary } from "react-error-boundary";
import type { FallbackProps } from "react-error-boundary";

export const AllSubscriptionsSection = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const { openSignIn } = useClerk();

  // 未加载完成时显示骨架屏
  if (!isLoaded) {
    return <AllSubscriptionsSectionSkeleton />;
  }

  // 未登录时打开登录模态框并显示骨架屏
  if (!isSignedIn) {
    openSignIn();
    return <AllSubscriptionsSectionSkeleton />;
  }

  const handleError = ({ error }: FallbackProps) => {
    const err = error as Error & { shape?: { data?: { code?: string } } };
    if (err.message?.includes("UNAUTHORIZED") || err.shape?.data?.code === "UNAUTHORIZED") {
      openSignIn();
    }
    return <AllSubscriptionsSectionSkeleton />;
  };

  return (
    <ErrorBoundary fallbackRender={handleError}>
      <AllSubscriptionsSectionSuspense />
    </ErrorBoundary>
  );
};

const AllSubscriptionsSectionSkeleton = () => {
  const isMobile = useIsMobile();
  
  if (isMobile) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-2">
            <Skeleton className="size-10 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-2 p-4">
          <Skeleton className="size-20 rounded-full" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
    </div>
  );
};

const AllSubscriptionsSectionSuspense = () => {
  const [subscriptions] = trpc.subscriptions.getMany.useSuspenseQuery();
  const isMobile = useIsMobile();

  if (subscriptions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="text-lg">No subscriptions yet</p>
        <p className="text-sm mt-2">Subscribe to channels to see them here</p>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="space-y-1">
        {subscriptions.map((sub) => (
          <UserLink
            key={sub.creatorId}
            userId={sub.creatorId}
            name={sub.creator.name}
            imageUrl={sub.creator.imageUrl}
            subscriberCount={sub.creator.subscriberCount}
            className="p-2 rounded-lg hover:bg-accent"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {subscriptions.map((sub) => (
        <UserLink
          key={sub.creatorId}
          userId={sub.creatorId}
          name={sub.creator.name}
          imageUrl={sub.creator.imageUrl}
          subscriberCount={sub.creator.subscriberCount}
          variant="card"
          avatarSize="xl"
        />
      ))}
    </div>
  );
};
