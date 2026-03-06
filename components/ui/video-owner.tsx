
import { VideoGetOneOutput } from "@/moubles/videos/type"
import { UserAvatar } from "@/components/user-avatar";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { Button } from "./button";
import { SubscriptionButton } from "@/moubles/subscriptions/ui/components/subscriptions-button";
import { UserInfo } from "@/moubles/users/ui/components/user-info";


interface VideoOwnerProps {
    user : VideoGetOneOutput["user"];
    videoId : string;
}



export const VideoOwner = ({user,videoId}:VideoOwnerProps) => {
 
   const {userId : clerkUserId} = useAuth();
    return (
    <div className="flex items-center sm:items-start justify-between sm:justify-start gap-3 min-w-0">
        <Link href={`/users/${user.id}`}>
        <div className="flex items-center gap-3 min-w-0">
           <UserAvatar size="lg" imageurl={user.imageUrl} name={user.name}  />
           <div className="flex flex-col min-w-0 gap-1">
           <UserInfo size="lg" name={user.name}/>
           <span className="text-sm text-muted-foreground  line-clamp-1">
            {/** add subscriber count */}
            {0} subscribers
           </span>
              </div>
        </div>
        </Link>
        { clerkUserId === user.clerkId ? (
              <Button
              asChild
              variant="secondary"
              className="rounded-full"
              >
                    <Link href={`/studio/videos/${videoId}`}>Edit video</Link>
              </Button>
        ) :  (
             <SubscriptionButton
             onClick={()=>{}}
             disabled={false}
             isSubscried={false}
             className="flex"
             />
        ) }
    </div>
)
}

