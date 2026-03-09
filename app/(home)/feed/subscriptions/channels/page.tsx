import { trpc, HydrateClient } from "@/trpc/server";
import { AllSubscriptionsSection } from "@/moubles/subscriptions/ui/sections/all-subscriptions-section";
import { SubscriptionManageModal } from "@/moubles/subscriptions/ui/components/subscription-manage-modal";

export const dynamic = "force-dynamic";

const AllSubscriptionsPage = async () => {
  void trpc.subscriptions.getMany.prefetch();

  return (
    <HydrateClient>
      <div className="max-w-[2400px] mx-auto mb-10 pt-2.5 flex flex-col gap-y-4 px-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">All subscriptions</h1>
          <SubscriptionManageModal />
        </div>
        <AllSubscriptionsSection />
      </div>
    </HydrateClient>
  );
};

export default AllSubscriptionsPage;
