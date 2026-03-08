"use client";

import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { InfiniteGrid } from "@/components/ui/infinite-grid";
import { Button } from "@/components/ui/button";
import { Trash2Icon, SettingsIcon } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface PlaylistDetailSectionProps {
  playlistId: string;
}

export const PlaylistDetailSection = ({ playlistId }: PlaylistDetailSectionProps) => {
  return (
    <Suspense fallback={<div className="py-20 text-center">Loading...</div>}>
      <ErrorBoundary
        fallback={
          <div className="py-20 text-center text-muted-foreground">
            Playlist not found
          </div>
        }
      >
        <PlaylistDetailSectionSuspense playlistId={playlistId} />
      </ErrorBoundary>
    </Suspense>
  );
};

const PlaylistDetailSectionSuspense = ({ playlistId }: PlaylistDetailSectionProps) => {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [playlist] = trpc.playlists.getOne.useSuspenseQuery({ id: playlistId });

  const [name, setName] = useState(playlist.name);
  const [description, setDescription] = useState(playlist.description || "");

  const updateMutation = trpc.playlists.update.useMutation({
    onSuccess: () => {
      toast.success("Playlist updated");
      utils.playlists.getOne.invalidate({ id: playlistId });
      utils.playlists.getMany.invalidate();
      setEditOpen(false);
    },
    onError: () => {
      toast.error("Failed to update playlist");
    },
  });

  const deleteMutation = trpc.playlists.remove.useMutation({
    onSuccess: () => {
      toast.success("Playlist deleted");
      utils.playlists.getMany.invalidate();
      router.push("/playlists");
    },
    onError: () => {
      toast.error("Failed to delete playlist");
    },
  });

  const handleUpdate = () => {
    updateMutation.mutate({
      id: playlistId,
      name,
      description: description || undefined,
    });
  };

  const handleDelete = () => {
    deleteMutation.mutate({ id: playlistId });
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">{playlist.name}</h1>
          {playlist.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {playlist.description}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            {playlist.videoCount} videos
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Edit Dialog */}
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <SettingsIcon className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Edit playlist</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4 py-4">
                <Input
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Textarea
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setEditOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdate} disabled={!name.trim() || updateMutation.isPending}>
                  Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Dialog */}
          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Trash2Icon className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Delete playlist?</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground py-4">
                This will permanently delete "{playlist.name}" and remove all videos from it.
              </p>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                >
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Videos */}
      <InfiniteGrid
        data={playlist.videos}
        hasNextPage={false}
        isFetchingNextPage={false}
        fetchNextPage={() => {}}
        emptyMessage="No videos in this playlist"
        emptyDescription="Add videos to your playlist"
      />
    </>
  );
};
