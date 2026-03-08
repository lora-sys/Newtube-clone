"use client";

import { Button } from "@/components/ui/button";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "@/components/ui/responsive-modal";
import { UploadDropzone } from "@/lib/uploadthing";
import { trpc } from "@/trpc/client";

interface BannerUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BannerUploadModal = ({
  open,
  onOpenChange,
}: BannerUploadModalProps) => {
  const utils = trpc.useUtils();

  const onUploadComplete = () => {
    onOpenChange(false);
    utils.users.getOne.invalidate();
  };

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <ResponsiveModalContent>
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Upload Banner</ResponsiveModalTitle>
        </ResponsiveModalHeader>
        <UploadDropzone
          endpoint="BannerUploader"
          onClientUploadComplete={onUploadComplete}
        />
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
};
