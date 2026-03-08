"use client";

import Link from "next/link";
import { UserAvatar } from "@/components/user-avatar";
import { cn } from "@/lib/utils";

interface UserLinkProps {
  userId: string;
  name: string;
  imageUrl: string;
  className?: string;
  avatarSize?: "xs" | "sm" | "default" | "lg" | "xl";
  showName?: boolean;
}

export const UserLink = ({
  userId,
  name,
  imageUrl,
  className,
  avatarSize = "default",
  showName = true,
}: UserLinkProps) => {
  return (
    <Link
      href={`/users/${userId}`}
      className={cn(
        "flex items-center gap-2 hover:opacity-80 transition-opacity",
        className
      )}
    >
      <UserAvatar
        imageurl={imageUrl}
        name={name}
        size={avatarSize}
      />
      {showName && (
        <span className="text-sm font-medium line-clamp-1">{name}</span>
      )}
    </Link>
  );
};
