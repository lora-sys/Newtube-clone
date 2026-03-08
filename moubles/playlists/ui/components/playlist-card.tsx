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
    <Link href={`/playlists/${data.id}`} className="group flex flex-col gap-2">
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
                    <ListVideo className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ListVideo className="w-12 h-12 text-muted-foreground" />
          </div>
        )}

        {/* Video Count Badge */}
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
          {data.videoCount} videos
        </div>

        {/* Visibility Badge */}
        <div className="absolute top-2 left-2 bg-black/80 text-white p-1 rounded">
          {data.visibility === "private" ? (
            <Lock className="w-3 h-3" />
          ) : (
            <Globe className="w-3 h-3" />
          )}
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1">
        <h3 className="font-medium text-sm line-clamp-1 group-hover:text-blue-500 transition-colors">
          {data.name}
        </h3>
        {data.description && (
          <p className="text-xs text-muted-foreground line-clamp-1">
            {data.description}
          </p>
        )}
      </div>
    </Link>
  );
};
