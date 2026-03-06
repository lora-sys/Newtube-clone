import { Button, ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SubscriptionButtonProps {
    onClick: ButtonProps["onClick"];
    disabled: boolean;
    isSubscried: boolean;
    className?: string;
    size?: ButtonProps["size"]
}


export const SubscriptionButton = ({
    onClick,
    disabled,
    isSubscried,
    className,
    size

}: SubscriptionButtonProps) => {
return (
    <Button
    size={size}
    className={className}
    disabled={disabled}
    onClick={onClick}
    >
        {
            isSubscried ? "Unsubscribe" : "subscribe"
        }
    </Button>
)
}