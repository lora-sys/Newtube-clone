"use client";

import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "@/components/ui/responsive-modal";
import { UploadDropzone } from "@/lib/uploadthing";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";

interface BannerUploadModalProps {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BannerUploadModal = ({
  userId,
  open,
  onOpenChange,
}: BannerUploadModalProps) => {
  const utils = trpc.useUtils();

  const onUploadComplete = () => {
    toast.success("Banner uploaded successfully");
    onOpenChange(false);
    utils.users.getOne.invalidate({ id: userId });
  };

  const onUploadError = (error: Error) => {
    toast.error(`Upload failed: ${error.message}`);
  };

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <ResponsiveModalContent className="max-h-[90dvh] lg:max-h-[85dvh]">
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Upload Banner</ResponsiveModalTitle>
        </ResponsiveModalHeader>
        <UploadDropzone
          endpoint="BannerUploader"
          onClientUploadComplete={onUploadComplete}
          onUploadError={onUploadError}
        />
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
};
