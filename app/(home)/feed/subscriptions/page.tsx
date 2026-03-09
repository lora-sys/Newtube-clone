import { trpc, HydrateClient } from "@/trpc/server";
import { SubscriptionsSection } from "@/moubles/videos/ui/sections/subscriptions-section";
import { SubscriptionManageModal } from "@/moubles/subscriptions/ui/components/subscription-manage-modal";
import { DEFAULT_LIMIT } from "@/constants";

export const dynamic = "force-dynamic";

const SubscriptionsPage = async () => {
  void trpc.videos.getSubscriptions.prefetchInfinite({ limit: DEFAULT_LIMIT });
  void trpc.subscriptions.getMany.prefetch();

  return (
    <HydrateClient>
      <div className="max-w-[2400px] mx-auto mb-10 pt-2.5 flex flex-col gap-y-4 px-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Subscriptions</h1>
          <SubscriptionManageModal />
        </div>
        <SubscriptionsSection />
      </div>
    </HydrateClient>
  );
};

export default SubscriptionsPage;
