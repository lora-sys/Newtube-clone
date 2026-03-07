import { useClerk } from "@clerk/nextjs";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";

interface UseSubscriptionProps {
    creatorId: string;
    isSubscribed: boolean;
    fromVideoId?: string;
    onSuccess?: () => void;
}

export const useSubscription = ({
    creatorId,
    isSubscribed,
    fromVideoId,
    onSuccess,
}: UseSubscriptionProps) => {
    const clerk = useClerk();
    const utils = trpc.useUtils();

    const subscribe = trpc.subscriptions.create.useMutation({
        onSuccess: () => {
            toast.success("Subscribed");
            if (fromVideoId) {
                utils.videos.getOne.invalidate({ id: fromVideoId });
            }
            onSuccess?.();
        },
        onError: (error) => {
            if (error.data?.code === "UNAUTHORIZED") {
                clerk.openSignIn();
            } else {
                toast.error("Something went wrong");
            }
        },
    });

    const unsubscribe = trpc.subscriptions.remove.useMutation({
        onSuccess: () => {
            toast.success("Unsubscribed");
            if (fromVideoId) {
                utils.videos.getOne.invalidate({ id: fromVideoId });
            }
            onSuccess?.();
        },
        onError: (error) => {
            if (error.data?.code === "UNAUTHORIZED") {
                clerk.openSignIn();
            } else {
                toast.error("Something went wrong");
            }
        },
    });

    const isPending = subscribe.isPending || unsubscribe.isPending;

    const onClick = () => {
        if (isSubscribed) {
            unsubscribe.mutate({ creatorId });
        } else {
            subscribe.mutate({ creatorId });
        }
    };

    return {
        isPending,
        onClick,
        subscribe,
        unsubscribe,
    };
};
