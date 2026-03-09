import { AlertTriangleIcon } from "lucide-react"

import { VideoGetOneOutput } from "@/moubles/videos/type"


interface VideoBannerProps {
    status : VideoGetOneOutput["muxStatus"]
}




export const VideoBanner = ({status}: VideoBannerProps) => {

    if( status === "ready") {
        return null;
    }

    return (
        <div className="bg-yellow-500 py-2 md:py-3 px-3 md:px-4 rounded-b-xl flex items-center gap-2">
             <AlertTriangleIcon className="size-4 text-black shrink-0"/>
             <p className="text-xs md:text-sm font-medium text-black line-clamp-2 md:line-clamp-1">
                This video is still being processed. Please check back later.
             </p>
        </div>
    )
} 