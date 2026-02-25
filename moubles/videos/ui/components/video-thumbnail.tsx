import { formatDuration } from "@/lib/utils";
import { THUMBNAIL_FLLBACK } from "@/moubles/studio/constants";
import Image from "next/image";

interface VideoThumbnailProps {
  imageurl?: string | null;
  title: string;
  previewUrl?: string | null;
  duration: number | 0;
}

export const VideoThumbnail = ({
  imageurl,
  previewUrl,
  duration,
}: VideoThumbnailProps) => {
  return (
    <div className="relative group">
      {/** Thumbnail wrapper */}
      <div className="relative w-full overflow-hidden rounded-xl aspect-video ">
        <Image
          src={imageurl || THUMBNAIL_FLLBACK}
          alt="Thumbnail"
          fill
          className="h-full w-full object-cover group-hover:opacity-0"
        />
      </div>
      <Image
        unoptimized={!!previewUrl}
        src={previewUrl ?? "/placeholder.svg"}
        alt="Thumbnail"
        fill
        className="h-full w-full object-cover opacity-0 group-hover:opacity-100"
      />
      {/** video duration box  */}
      {/** TODO: add video duration box */}
      <div className="absolute  bottom-2 right-2 bg-black/80 text-white text-xs font-medium">
        {formatDuration(duration)}
      </div>
    </div>
  );
};
