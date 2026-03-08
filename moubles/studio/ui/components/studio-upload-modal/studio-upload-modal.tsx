"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/ui/responsive-dialog";
import { trpc } from "@/trpc/client";
import { Loader2Icon, PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { StudioUploader } from "../../studio-uploader";
import { useRouter } from "next/navigation";

type CreateData = {
  video: { id: string };
  url: string;
};

export const StudioUploadModal = () => {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadData, setUploadData] = useState<CreateData | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const uploaderRef = useRef<HTMLDivElement>(null);

  const create = trpc.videos.create.useMutation({
    onSuccess: (data) => {
      setUploadData(data);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const remove = trpc.videos.removeDraft.useMutation({
    onSuccess: () => {
      utils.studio.getMany.invalidate();
    },
  });

  const handleOpenModal = () => {
    setIsModalOpen(true);
    // 打开模态框后自动触发创建
    if (!uploadData && !create.isPending) {
      create.mutate();
    }
  };

  const handleCloseModal = useCallback(() => {
    // 如果正在上传，警告用户
    if (isUploading) {
      const confirm = window.confirm(
        "Upload in progress. Are you sure you want to cancel?"
      );
      if (!confirm) return;

      // 删除视频记录
      if (uploadData?.video.id) {
        remove.mutate({ id: uploadData.video.id });
      }
    }

    setIsModalOpen(false);
    setUploadData(null);
    setIsUploading(false);
    create.reset();
  }, [isUploading, uploadData, remove]);

  const handleUploadStart = useCallback(() => {
    setIsUploading(true);
  }, []);

  const handleUploadSuccess = useCallback(() => {
    if (!uploadData?.video.id) return;
    const videoId = uploadData.video.id;
    toast.success("Video uploaded successfully");
    setUploadData(null);
    setIsUploading(false);
    setIsModalOpen(false);
    router.push(`/studio/videos/${videoId}`);
  }, [uploadData, router]);

  return (
    <>
      <ResponsiveModal
        title="Upload a video"
        open={isModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseModal();
          }
        }}
      >
        {create.isPending || !uploadData?.url ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2Icon className="size-10 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Preparing upload...</p>
          </div>
        ) : (
          <div ref={uploaderRef}>
            <StudioUploader
              endpoint={uploadData.url}
              onSuccess={handleUploadSuccess}
              onUploadStart={handleUploadStart}
            />
          </div>
        )}
      </ResponsiveModal>

      <Button variant="secondary" onClick={handleOpenModal}>
        <PlusIcon className="size-4" />
        Create
      </Button>
    </>
  );
};
