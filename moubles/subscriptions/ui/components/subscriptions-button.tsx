"use client";

import { Button, ButtonProps } from "@/components/ui/button"
import { useSubscription } from "@/hooks/use-subscription"

interface SubscriptionButtonProps {
    creatorId: string;
    isSubscribed: boolean;
    fromVideoId?: string;
    disabled?: boolean;
    className?: string;
    size?: ButtonProps["size"]
}


export const SubscriptionButton = ({
    creatorId,
    isSubscribed,
    fromVideoId,
    disabled,
    className,
    size,
}: SubscriptionButtonProps) => {
    const { onClick, isPending } = useSubscription({
        creatorId,
        isSubscribed,
        fromVideoId,
    });

    return (
        <Button
            size={size}
            className={className}
            disabled={disabled || isPending}
            onClick={onClick}
            variant={isSubscribed ? "secondary" : "default"}
        >
            {isPending
                ? "Loading..."
                : isSubscribed
                    ? "Unsubscribe"
                    : "Subscribe"
            }
        </Button>
    )
}