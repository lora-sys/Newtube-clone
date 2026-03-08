"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { InfiniteScroll } from "./infinite";
import { VideoGridCard, VideoGridCardSkeleton } from "@/moubles/videos/ui/components/video-grid-card";
import { VideoRowCard, VideoRowCardSkeleton } from "@/moubles/videos/ui/components/video-row-card";
import { useIsMobile } from "@/hooks/use-mobile";

interface Video {
  id: string;
  title: string;
  thumbnailurl: string | null;
  previewUrl: string | null;
  duration: number | null;
  createAt: Date;
  updateAt: Date;
  muxPlaybackId: string | null;
  description: string | null;
  user: {
    id: string;
    name: string;
    imageUrl: string;
  };
  viewCount: number;
  likeCount: number;
}

interface InfiniteGridProps {
  data: Video[];
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  emptyMessage?: string;
  emptyDescription?: string;
  /** 是否在稍后观看列表中（用于显示移除选项） */
  isInWatchLater?: boolean;
  /** 从稍后观看移除后的回调 */
  onWatchLaterRemove?: (videoId: string) => void;
}

const InfiniteGridSkeleton = () => {
  return (
    <>
      <div className="flex flex-col gap-4 md:hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <VideoRowCardSkeleton key={i} size="compact" />
        ))}
      </div>
      <div className="hidden md:grid gap-4 gap-y-10 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <VideoGridCardSkeleton key={i} />
        ))}
      </div>
    </>
  );
};

export const InfiniteGrid = ({
  data,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  emptyMessage = "No videos found",
  emptyDescription = "Try adjusting your filters or check back later",
  isInWatchLater = false,
  onWatchLaterRemove,
}: InfiniteGridProps) => {
  const isMobile = useIsMobile();

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="text-lg">{emptyMessage}</p>
        <p className="text-sm mt-2">{emptyDescription}</p>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="flex flex-col gap-4">
        {data.map((video) => (
          <VideoRowCard
            key={video.id}
            data={video}
            size="compact"
            isInWatchLater={isInWatchLater}
            onWatchLaterRemove={onWatchLaterRemove ? () => onWatchLaterRemove(video.id) : undefined}
          />
        ))}
        <InfiniteScroll
          hasNextPage={hasNextPage}
          isFetchingNeatPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="gap-4 gap-y-10 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {data.map((video) => (
          <VideoGridCard
            key={video.id}
            data={video}
            isInWatchLater={isInWatchLater}
            onWatchLaterRemove={onWatchLaterRemove ? () => onWatchLaterRemove(video.id) : undefined}
          />
        ))}
      </div>
      <InfiniteScroll
        hasNextPage={hasNextPage}
        isFetchingNeatPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
      />
    </div>
  );
};

// 包装器组件，用于处理 Suspense �� ErrorBoundary
interface InfiniteGridWrapperProps {
  children: React.ReactNode;
  errorMessage?: string;
}

export const InfiniteGridWrapper = ({
  children,
  errorMessage = "Failed to load content",
}: InfiniteGridWrapperProps) => {
  return (
    <Suspense fallback={<InfiniteGridSkeleton />}>
      <ErrorBoundary
        fallbackRender={({ error, resetErrorBoundary }) => (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <p className="text-lg">{errorMessage}</p>
            <button
              onClick={resetErrorBoundary}
              className="mt-4 text-sm text-blue-500 hover:underline"
            >
              Try again
            </button>
          </div>
        )}
      >
        {children}
      </ErrorBoundary>
    </Suspense>
  );
};
