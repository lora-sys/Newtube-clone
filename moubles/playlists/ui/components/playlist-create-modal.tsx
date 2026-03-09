"use client";

import { Button } from "@/components/ui/button";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalTrigger,
} from "@/components/ui/responsive-modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/trpc/client";
import { useState } from "react";
import { toast } from "sonner";
import { PlusIcon } from "lucide-react";

export const PlaylistCreateModal = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const utils = trpc.useUtils();

  const createMutation = trpc.playlists.create.useMutation({
    onSuccess: () => {
      toast.success("Playlist created");
      utils.playlists.getMany.invalidate();
      setOpen(false);
      setName("");
      setDescription("");
    },
    onError: () => {
      toast.error("Failed to create playlist");
    },
  });

  const handleSubmit = () => {
    if (!name.trim()) return;
    createMutation.mutate({
      name: name.trim(),
      description: description.trim() || undefined,
    });
  };

  return (
    <ResponsiveModal open={open} onOpenChange={setOpen}>
      <ResponsiveModalTrigger asChild>
        <Button variant="outline" size="sm">
          <PlusIcon className="w-4 h-4 mr-2" />
          New playlist
        </Button>
      </ResponsiveModalTrigger>
      <ResponsiveModalContent>
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Create playlist</ResponsiveModalTitle>
        </ResponsiveModalHeader>
        <div className="flex flex-col gap-4 py-4">
          <Input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim() || createMutation.isPending}>
            Create
          </Button>
        </div>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
};
