"use client";

import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ListVideo, Lock, Globe } from "lucide-react";

interface PlaylistCardProps {
  data: {
    id: string;
    name: string;
    description: string | null;
    visibility: "private" | "public";
    videoCount: number;
    thumbnails: (string | null)[];
    createAt: Date;
  };
}

export const PlaylistCardSkeleton = () => {
  return (
    <div className="flex flex-col gap-2">
      <div className="relative aspect-video rounded-lg overflow-hidden bg-secondary">
        <Skeleton className="absolute inset-0" />
      </div>
      <div className="flex flex-col gap-1">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
};

export const PlaylistCard = ({ data }: PlaylistCardProps) => {
  const thumbnailCount = data.thumbnails.length;
  const gridCols =
    thumbnailCount === 1 ? "grid-cols-1" :
    thumbnailCount === 2 ? "grid-cols-2" :
    "grid-cols-2 grid-rows-2";

  return (
    <Link 
      href={`/playlists/${data.id}`} 
      className="group flex flex-col gap-2 min-h-[44px]" // 触摸友好
    >
      {/* Thumbnail Grid */}
      <div className="relative aspect-video rounded-lg overflow-hidden bg-secondary border">
        {thumbnailCount > 0 ? (
          <div className={cn("grid h-full", gridCols)}>
            {data.thumbnails.slice(0, 4).map((thumbnail, index) => (
              <div key={index} className="relative overflow-hidden">
                {thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={thumbnail}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-muted flex items-center justify-center">
                    <ListVideo className="w-5 h-5 md:w-6 md:h-6 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ListVideo className="w-10 h-10 md:w-12 md:h-12 text-muted-foreground" />
          </div>
        )}

        {/* Video Count Badge */}
        <div className="absolute bottom-1.5 right-1.5 md:bottom-2 md:right-2 bg-black/80 text-white text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded">
          {data.videoCount}
        </div>

        {/* Visibility Badge */}
        <div className="absolute top-1.5 left-1.5 md:top-2 md:left-2 bg-black/80 text-white p-1 rounded">
          {data.visibility === "private" ? (
            <Lock className="w-3 h-3" />
          ) : (
            <Globe className="w-3 h-3" />
          )}
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-0.5 md:gap-1">
        <h3 className="font-medium text-sm line-clamp-2 md:line-clamp-1 group-hover:text-blue-500 transition-colors">
          {data.name}
        </h3>
        {data.description && (
          <p className="text-xs text-muted-foreground line-clamp-1 hidden md:block">
            {data.description}
          </p>
        )}
      </div>
    </Link>
  );
};
