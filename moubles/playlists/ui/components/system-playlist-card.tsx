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
    <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl bg-muted/50">
      <Skeleton className="w-28 h-16 md:w-40 md:h-24 rounded-xl shrink-0" />
      <div className="flex flex-col gap-2 flex-1">
        <Skeleton className="h-4 w-20 md:w-24" />
        <Skeleton className="h-3 w-14 md:w-16" />
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
      className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl bg-muted/50 hover:bg-muted/80 hover:shadow-md transition-all group"
    >
      {/* Thumbnails Grid */}
      <div className="relative w-28 h-16 md:w-40 md:h-24 rounded-xl overflow-hidden bg-secondary flex-shrink-0">
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
            <Icon className="w-6 h-6 md:w-8 md:h-8 text-muted-foreground" />
          </div>
        )}

        {/* Count Badge */}
        <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] md:text-xs px-1 md:px-1.5 py-0.5 rounded">
          {count}
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1 min-w-0">
        <div className="flex items-center gap-2">
          <Icon className="w-3.5 h-3.5 md:w-4 md:h-4 text-muted-foreground shrink-0" />
          <span className="font-medium text-sm group-hover:text-blue-500 transition-colors line-clamp-1">
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
