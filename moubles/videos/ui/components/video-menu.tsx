
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVerticalIcon, ShareIcon, TrashIcon } from "lucide-react";
import { toast } from "sonner";

interface VideoMenuProps {
    videoId: string;
    variant?: "ghost" | "secondary";
    onRemove?: () => void
}


// TODO: implement left
export const VideoMenu = ({
    videoId,
    onRemove,
    variant
}: VideoMenuProps) => {

 const onShare = () => {
    // TODO: CHANGE id deploying outside of vercel
    const fullUrl = `${process.env.VERCEL_URL || "http://localhost:3000"}/videos/${videoId} `;
    navigator.clipboard.writeText(fullUrl);
    toast.success("Link is copied to the clipbord")
 }


    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant={variant} size="icon" className="rounded-full">
                    <MoreVerticalIcon />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem onClick={onShare}>
                    <ShareIcon className="mr-2 size-4" />
                    Share
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => { }}>
                    <ShareIcon className="mr-2 size-4" />
                    Add to playlist
                </DropdownMenuItem>
                {onRemove &&
                    <DropdownMenuItem onClick={() => { }}>
                        <TrashIcon className="mr-2 size-4" />
                        Remove

                    </DropdownMenuItem>
                }
            </DropdownMenuContent>
        </DropdownMenu>
    )
}