import { formatDuration } from "@/lib/utils";
import { THUMBNAIL_FLLBACK } from "@/moubles/studio/constants";
import Image from "next/image";

interface VideoThumbnailProps {
  imageurl?: string | null;
  title: string;
  previewUrl?: string | null;
  duration: number | 0;
  muxPlaybackId?: string | null;
}

export const VideoThumbnail = ({
  imageurl,
  title,
  previewUrl,
  duration,
  muxPlaybackId,
}: VideoThumbnailProps) => {
  // 优先级: imageurl > Mux thumbnail > fallback
  const thumbnailUrl = imageurl || (muxPlaybackId ? `https://image.mux.com/${muxPlaybackId}/thumbnail.jpg` : THUMBNAIL_FLLBACK);
  const previewUrlFinal = previewUrl || (muxPlaybackId ? `https://image.mux.com/${muxPlaybackId}/animated.gif` : null);

  return (
    <div className="relative group">
      {/** Thumbnail wrapper */}
      <div className="relative w-full overflow-hidden rounded-xl aspect-video bg-muted">
        <Image
          src={thumbnailUrl}
          alt={title}
          fill
          // NOTE: UploadThing CDN 响应较慢，跳过 Next.js Image 优化避免超时
          // 当 imageurl 存在时（UploadThing URL），直接使用原图
          unoptimized={!!imageurl}
          className="h-full w-full object-cover group-hover:opacity-0"
        />
        {previewUrlFinal && (
          <Image
            unoptimized
            src={previewUrlFinal}
            alt={title}
            fill
            className="h-full w-full object-cover opacity-0 group-hover:opacity-100"
          />
        )}
      </div>
      {/** video duration box  */}
      {duration > 0 && (
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-medium px-1 rounded">
          {formatDuration(duration)}
        </div>
      )}
    </div>
  );
};
