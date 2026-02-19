import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { useEffect } from "react";
import { Button } from "./button";

interface InfiniteScrollProps {
isManual ?: boolean,
hasNextPage : boolean,
isFetchingNeatPage : boolean,
fetchNextPage : ()=> void;
}

export const InfiniteScroll = ({
isManual = false,
hasNextPage,
isFetchingNeatPage,
fetchNextPage,
} : InfiniteScrollProps)=> {

    const {targetRef,isIntersecting} = useIntersectionObserver({
        threshold : 0.5,
        rootMargin : "100px",
    });

    useEffect (()=> {
     if (isIntersecting && hasNextPage && !isFetchingNeatPage && !isManual) {
        fetchNextPage();
     }
    },[hasNextPage,isFetchingNeatPage,isManual,fetchNextPage,isIntersecting])
    return (

       <div
       className="flex flex-col items-center gap-4 p-4"
       > 
       <div ref={targetRef} className="h-1">
        {hasNextPage ? (
          <Button variant="secondary" disabled={!hasNextPage || isFetchingNeatPage}
          onClick={()=> fetchNextPage()}>
            {isFetchingNeatPage ? "Loading" : "load more"}
          </Button>
        ) : (
            <p className="text-xs text-muted-foreground">You are reached the  end of list</p>
        )}
       </div>
       

       </div>
    )
}