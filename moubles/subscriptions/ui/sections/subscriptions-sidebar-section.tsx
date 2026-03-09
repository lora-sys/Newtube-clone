"use client";

import { Suspense, useEffect, useState } from "react";
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/trpc/client";
import { UserAvatar } from "@/components/user-avatar";
import Link from "next/link";
import { ChevronDownIcon } from "lucide-react";
import { useAuth } from "@clerk/nextjs";

const SUBSCRIPTIONS_LIMIT = 5;

export const SubscriptionsSidebarSection = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isLoaded) {
    return <SubscriptionsSidebarSkeleton />;
  }

  if (!isSignedIn) {
    return null;
  }

  return (
    <Suspense fallback={<SubscriptionsSidebarSkeleton />}>
      <SubscriptionsSidebarSectionSuspense />
    </Suspense>
  );
};

const SubscriptionsSidebarSkeleton = () => (
  <SidebarGroup>
    <SidebarGroupLabel>Subscriptions</SidebarGroupLabel>
    <SidebarGroupContent>
      <SidebarMenu>
        {Array.from({ length: 3 }).map((_, i) => (
          <SidebarMenuItem key={i}>
            <SidebarMenuButton disabled>
              <Skeleton className="size-6 rounded-full" />
              <Skeleton className="h-4 w-20" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroupContent>
  </SidebarGroup>
);

const SubscriptionsSidebarSectionSuspense = () => {
  const [subscriptions] = trpc.subscriptions.getMany.useSuspenseQuery({
    limit: SUBSCRIPTIONS_LIMIT,
  });

  if (subscriptions.length === 0) {
    return null;
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Subscriptions</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {subscriptions.map((sub) => (
            <SidebarMenuItem key={sub.creatorId}>
              <SidebarMenuButton asChild tooltip={sub.creator.name}>
                <Link
                  href={`/users/${sub.creatorId}`}
                  className="flex items-center gap-3"
                >
                  <UserAvatar
                    imageurl={sub.creator.imageUrl}
                    name={sub.creator.name}
                    size="sm"
                  />
                  <span className="text-sm truncate">{sub.creator.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link
                href="/feed/subscriptions/channels"
                className="flex items-center gap-3 text-muted-foreground"
              >
                <ChevronDownIcon className="size-4" />
                <span className="text-sm">Show more</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
