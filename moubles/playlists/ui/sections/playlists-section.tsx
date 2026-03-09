"use client";

import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { PlaylistCard, PlaylistCardSkeleton } from "../components/playlist-card";
import { InfiniteScroll } from "@/components/ui/infinite";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { DEFAULT_LIMIT } from "@/constants";

export const PlaylistsSection = () => {
  return (
    <Suspense fallback={<PlaylistsSectionSkeleton />}>
      <ErrorBoundary
        fallback={
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <p className="text-lg">Failed to load playlists</p>
          </div>
        }
      >
        <PlaylistsSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  );
};

const PlaylistsSectionSkeleton = () => {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <PlaylistCardSkeleton key={i} />
      ))}
    </div>
  );
};

const PlaylistsSectionSuspense = () => {
  const [results, resultsQuery] = trpc.playlists.getMany.useSuspenseInfiniteQuery(
    { limit: DEFAULT_LIMIT },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  if (results.pages[0].items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="text-lg">No playlists yet</p>
        <p className="text-sm mt-2">Create a playlist to organize your videos</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {results.pages.flatMap((page) => page.items).map((playlist) => (
          <PlaylistCard key={playlist.id} data={playlist} />
        ))}
      </div>
      <InfiniteScroll
        hasNextPage={resultsQuery.hasNextPage}
        isFetchingNeatPage={resultsQuery.isFetchingNextPage}
        fetchNextPage={resultsQuery.fetchNextPage}
      />
    </div>
  );
};
