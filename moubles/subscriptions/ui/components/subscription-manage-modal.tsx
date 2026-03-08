"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { trpc } from "@/trpc/client";
import { UserAvatar } from "@/components/user-avatar";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const SubscriptionManageModalContent = () => {
  const utils = trpc.useUtils();

  const [subscriptions] = trpc.subscriptions.getMany.useSuspenseQuery();

  const removeMutation = trpc.subscriptions.remove.useMutation({
    onSuccess: () => {
      toast.success("Unsubscribed");
      utils.subscriptions.getMany.invalidate();
      utils.videos.getSubscriptions.invalidate();
    },
    onError: () => {
      toast.error("Something went wrong");
    },
  });

  const handleUnsubscribe = (creatorId: string) => {
    removeMutation.mutate({ creatorId });
  };

  return (
    <div className="flex flex-col gap-3 py-4">
      {subscriptions.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          No subscriptions yet
        </p>
      ) : (
        subscriptions.map((sub) => (
          <div
            key={sub.creatorId}
            className="flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <UserAvatar
                size="default"
                imageurl={sub.creator.imageUrl}
                name={sub.creator.name}
              />
              <span className="font-medium text-sm">{sub.creator.name}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-sm"
              onClick={() => handleUnsubscribe(sub.creatorId)}
              disabled={removeMutation.isPending}
            >
              Subscribed
            </Button>
          </div>
        ))
      )}
    </div>
  );
};

const SubscriptionManageModalSkeleton = () => (
  <div className="flex flex-col gap-3 py-4">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-8 w-20" />
      </div>
    ))}
  </div>
);

export const SubscriptionManageModal = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Manage
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage subscriptions</DialogTitle>
        </DialogHeader>
        <Suspense fallback={<SubscriptionManageModalSkeleton />}>
          <SubscriptionManageModalContent />
        </Suspense>
      </DialogContent>
    </Dialog>
  );
};
