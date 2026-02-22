import { VideosSection } from "../sections/videos-section"

export const StudioView = () => {
return (
    <div className="flex flex-col gap-y-6 pt-2.5 ">
        <div className="px-4">
                 <h1 className="text-3xl font-bold ">channel content</h1>   
        </div>
        <p className="text-xl text-muted-foreground ml-1 ">
            Manage your channel content and videos
        </p>
        <VideosSection />
    </div>
)
}



