"use client";
interface VideoPlayerProps {
    playbackId? : string | null |undefined;
    thumbnailUrl? : string | null | undefined;
    autoPlay? : boolean;
    onPlay? : ()=>void;
 }

import { THUMBNAIL_FLLBACK } from "@/moubles/studio/constants";
import MuxPlayer from "@mux/mux-player-react"
 export  const VideoPlayer = ({
    playbackId,
    thumbnailUrl,
    autoPlay,
    onPlay,
 } : VideoPlayerProps) => {
    if(!playbackId) {
        return null
    }
    return (
        <MuxPlayer 
        playbackId={playbackId}
        poster={thumbnailUrl || THUMBNAIL_FLLBACK}
        playerInitTime={0}
        autoPlay={autoPlay}
        thumbnailTime={0}
        className="w-full h-full object-contain"
        accentColor="#FF2056"
        onPlay={onPlay}
        />
    )

 }