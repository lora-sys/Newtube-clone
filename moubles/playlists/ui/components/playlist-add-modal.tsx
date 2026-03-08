"use client";

import { useState } from "react";
import { PlusIcon, CheckIcon, ListPlusIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalTrigger,
} from "@/components/ui/responsive-modal";
import { Input } from "@/components/ui/input";
import { trpc } from "@/trpc/client";

interface PlaylistAddModalProps {
  videoId: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const PlaylistAddModal = ({
  videoId,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: PlaylistAddModalProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const open = controlledOpen ?? internalOpen;
  const setOpen = setControlledOpen ?? setInternalOpen;

  const utils = trpc.useUtils();

  // 获取播放列表（带视频状态）
  const { data: playlists, isLoading } = trpc.playlists.getManyForVideo.useQuery(
    { videoId },
    { enabled: open }
  );

  // 添加视频到播放列表
  const addVideo = trpc.playlists.addVideo.useMutation({
    onSuccess: (_, variables) => {
      toast.success("Added to playlist");
      utils.playlists.getManyForVideo.invalidate({ videoId });
      utils.playlists.getMany.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to add: ${error.message}`);
    },
  });

  // 从播放列表移除视频
  const removeVideo = trpc.playlists.removeVideo.useMutation({
    onSuccess: () => {
      toast.success("Removed from playlist");
      utils.playlists.getManyForVideo.invalidate({ videoId });
      utils.playlists.getMany.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to remove: ${error.message}`);
    },
  });

  // 创建新播放列表
  const createPlaylist = trpc.playlists.create.useMutation({
    onSuccess: (playlist) => {
      // 创建后自动添加视频
      addVideo.mutate({ playlistId: playlist.id, videoId });
      setNewPlaylistName("");
      setIsCreating(false);
      utils.playlists.getMany.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to create: ${error.message}`);
    },
  });

  const handleToggle = (playlistId: string, containsVideo: boolean) => {
    if (containsVideo) {
      removeVideo.mutate({ playlistId, videoId });
    } else {
      addVideo.mutate({ playlistId, videoId });
    }
  };

  const handleCreate = () => {
    if (!newPlaylistName.trim()) return;
    createPlaylist.mutate({ name: newPlaylistName.trim() });
  };

  return (
    <ResponsiveModal open={open} onOpenChange={setOpen}>
      <ResponsiveModalTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <ListPlusIcon className="size-4" />
        </Button>
      </ResponsiveModalTrigger>
      <ResponsiveModalContent className="max-w-sm">
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Save to...</ResponsiveModalTitle>
        </ResponsiveModalHeader>
        <div className="py-2">
          {/* 创建新播放列表 */}
          {isCreating ? (
            <div className="flex gap-2 mb-3 px-1">
              <Input
                placeholder="Enter playlist name"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                autoFocus
              />
              <Button
                size="sm"
                onClick={handleCreate}
                disabled={!newPlaylistName.trim() || createPlaylist.isPending}
              >
                Create
              </Button>
            </div>
          ) : (
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-3 w-full px-1 py-2 rounded-lg hover:bg-accent transition-colors text-left"
            >
              <div className="flex items-center justify-center size-10 rounded-lg border-2 border-dashed border-muted-foreground/30">
                <PlusIcon className="size-5 text-muted-foreground" />
              </div>
              <span className="font-medium">Create new playlist</span>
            </button>
          )}

          {/* 分割线 */}
          <div className="h-px bg-border my-2" />

          {/* 播放列表 */}
          {isLoading ? (
            <div className="px-1 py-4 text-center text-muted-foreground text-sm">
              Loading...
            </div>
          ) : playlists?.length === 0 && !isCreating ? (
            <div className="px-1 py-4 text-center text-muted-foreground text-sm">
              No playlists yet. Create one above!
            </div>
          ) : (
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {playlists?.map((playlist) => (
                <button
                  key={playlist.id}
                  onClick={() => handleToggle(playlist.id, playlist.containsVideo)}
                  disabled={addVideo.isPending || removeVideo.isPending}
                  className={cn(
                    "flex items-center gap-3 w-full px-1 py-2 rounded-lg transition-colors text-left",
                    playlist.containsVideo
                      ? "bg-primary/10 hover:bg-primary/15"
                      : "hover:bg-accent"
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center justify-center size-10 rounded-lg text-sm font-medium",
                      playlist.containsVideo
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {playlist.containsVideo ? (
                      <CheckIcon className="size-5" />
                    ) : (
                      playlist.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{playlist.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {playlist.videoCount} video{playlist.videoCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
};
