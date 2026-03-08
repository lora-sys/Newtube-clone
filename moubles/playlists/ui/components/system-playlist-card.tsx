"use client";

import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ThumbsUpIcon, ClockIcon } from "lucide-react";

interface SystemPlaylistCardProps {
  title: string;
  icon: "liked" | "watchLater";
  count: number;
  thumbnails: (string | null)[];
  href: string;
}

export const SystemPlaylistCardSkeleton = () => {
  return (
    <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
      <Skeleton className="w-40 h-24 rounded-md" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
};

export const SystemPlaylistCard = ({
  title,
  icon,
  count,
  thumbnails,
  href,
}: SystemPlaylistCardProps) => {
  const Icon = icon === "liked" ? ThumbsUpIcon : ClockIcon;

  return (
    <Link
      href={href}
      className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
    >
      {/* Thumbnails Grid */}
      <div className="relative w-40 h-24 rounded-md overflow-hidden bg-secondary flex-shrink-0">
        {thumbnails.length > 0 ? (
          <div className="grid grid-cols-2 grid-rows-2 h-full">
            {thumbnails.slice(0, 4).map((thumbnail, index) => (
              <div key={index} className="relative overflow-hidden">
                {thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={thumbnail}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-muted" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon className="w-8 h-8 text-muted-foreground" />
          </div>
        )}

        {/* Count Badge */}
        <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
          {count} videos
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium text-sm group-hover:text-blue-500 transition-colors">
            {title}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {count === 0 ? "No videos" : `${count} videos`}
        </p>
      </div>
    </Link>
  );
};
