"use client";

import Link from "next/link";
import { UserAvatar } from "@/components/user-avatar";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const userLinkVariants = cva(
  "flex items-center gap-2 hover:opacity-80 transition-opacity min-h-[44px] min-w-[44px]",
  {
    variants: {
      variant: {
        default: "",
        card: "flex-col gap-1 p-4 rounded-lg bg-muted/50 hover:bg-muted",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface UserLinkProps extends VariantProps<typeof userLinkVariants> {
  userId: string;
  name: string;
  imageUrl: string;
  className?: string;
  avatarSize?: "xs" | "sm" | "default" | "lg" | "xl";
  showName?: boolean;
  subscriberCount?: number;
}

export const UserLink = ({
  userId,
  name,
  imageUrl,
  className,
  avatarSize = "default",
  showName = true,
  subscriberCount,
  variant = "default",
}: UserLinkProps) => {
  const formatCount = (count: number) => {
    return Intl.NumberFormat("en", {
      notation: "compact",
    }).format(count);
  };

  return (
    <Link
      href={`/users/${userId}`}
      className={cn(userLinkVariants({ variant }), className)}
    >
      <UserAvatar
        imageurl={imageUrl}
        name={name}
        size={variant === "card" ? "lg" : avatarSize}
      />
      {showName && (
        <div className={cn("flex flex-col", variant === "card" && "items-center text-center")}>
          <span className="text-sm font-medium line-clamp-1">{name}</span>
          {subscriberCount !== undefined && (
            <span className="text-xs text-muted-foreground">
              {formatCount(subscriberCount)} subscribers
            </span>
          )}
        </div>
      )}
    </Link>
  );
};
