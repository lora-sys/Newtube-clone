"use client";

import { Button, ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { trpc } from "@/trpc/client"
import { useClerk } from "@clerk/nextjs"
import { toast } from "sonner"

interface SubscriptionButtonProps {
    creatorId: string;
    isSubscribed: boolean;
    disabled?: boolean;
    className?: string;
    size?: ButtonProps["size"]
    onClick?: () => void;
}


export const SubscriptionButton = ({
    creatorId,
    isSubscribed,
    disabled,
    className,
    size,
    onClick,
}: SubscriptionButtonProps) => {
    const clerk = useClerk();
    const utils = trpc.useUtils();

    const subscribe = trpc.subscriptions.create.useMutation({
        onSuccess: () => {
            toast.success("Subscribed");
            utils.videos.getOne.invalidate();
            onClick?.();
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
            utils.videos.getOne.invalidate();
            onClick?.();
        },
        onError: (error) => {
            if (error.data?.code === "UNAUTHORIZED") {
                clerk.openSignIn();
            } else {
                toast.error("Something went wrong");
            }
        },
    });

    const handleClick = () => {
        if (isSubscribed) {
            unsubscribe.mutate({ creatorId });
        } else {
            subscribe.mutate({ creatorId });
        }
    };

    return (
        <Button
            size={size}
            className={className}
            disabled={disabled || subscribe.isPending || unsubscribe.isPending}
            onClick={handleClick}
            variant={isSubscribed ? "secondary" : "default"}
        >
            {subscribe.isPending || unsubscribe.isPending
                ? "Loading..."
                : isSubscribed
                    ? "Unsubscribe"
                    : "Subscribe"
            }
        </Button>
    )
}