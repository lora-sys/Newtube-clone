import { Button } from "@/components/ui/button";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalTrigger,
} from "@/components/ui/responsive-modal";
import { UploadDropzone } from "@/lib/uploadthing";
import { trpc } from "@/trpc/client";


interface ThumbnailUploadModalProps {
  videoId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ThumbnailUploadModal = ({
  videoId,
  open,
  onOpenChange,
}: ThumbnailUploadModalProps) => {

 const utils = trpc.useUtils();
 const onUploadComplete = () => {
    onOpenChange(false)
    utils.studio.getMany.invalidate()
    utils.studio.getOne.invalidate({id : videoId})
 }
    return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <ResponsiveModalContent>
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Upload Thumbnail</ResponsiveModalTitle>
        </ResponsiveModalHeader>
        <UploadDropzone
          endpoint="ThumbnailUploader"
          input={{ videoId }}
          onClientUploadComplete={onUploadComplete}
        />
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
};
