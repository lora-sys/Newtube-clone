"use client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import React from "react";
import { Skeleton } from "./skeleton";

interface FilterCarouseProps {
  value?: string | null;
  isLoading?: boolean;
  onSelect: (value: string | null) => void;
  data: {
    value: string;
    label: string;
  }[];
}

export const FilterCarouse = ({
  value,
  onSelect,
  data,
  isLoading,
}: FilterCarouseProps) => {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  return (
    <div className="w-full relative">
      {/** left fade */}
      <div
        className={cn(
          "absolute left-12 top-0 bottom-0 w-12 z-10 bg-gradient-to-r from-white to-transparent pointer-events-none",
          current === 1 && "hidden",
        )}
      />

      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          dragFree: true,
        }}
        className="w-ful px-12"
      >
        <CarouselContent className="-ml-3">
          {!isLoading && (
            <CarouselItem
              className="pl-3 basis-auto"
              onClick={() => onSelect?.(null)}
            >
              <Badge
                variant={value === null ? "default" : "secondary"}
                className="rouned-lg px-3 py-1 cursor-pointer whitespace-nowrap text-sm"
              >
                ALL
              </Badge>
            </CarouselItem>
          )}

          {isLoading &&
            Array.from({ length: 14 }).map((_, index) => (
              <CarouselItem key={index} className="pl-3 basis-auto">
                <Skeleton className="rounded-lg px-3 py-1 h-full text-sm w-[100px] font-semibold">
                  &nbsp
                </Skeleton>
              </CarouselItem>
            ))}

          {!isLoading &&
            data.map((item) => (
              <CarouselItem
                key={item.value}
                className="basis-auto pl-3"
                onClick={() => onSelect?.(item.value)}
              >
                <Badge
                  variant={value === item.value ? "default" : "secondary"}
                  onClick={() => onSelect?.(item.value)}
                  className="rounded-lg px-3 py-1 cursor-pointer whitespace-nowrap text-sm"
                >
                  {item.label}
                </Badge>
              </CarouselItem>
            ))}
        </CarouselContent>
        <CarouselPrevious className="left-2 z-30" disabled={false} />
        <CarouselNext className="right-2 z-30" disabled={false} />
      </Carousel>
      {/** right fade */}
      <div
        className={cn(
          "absolute right-12 top-0 bottom-0 w-12 z-10 bg-gradient-to-l from-white to-transparent pointer-events-none",
          current === count && "hidden",
        )}
      />
    </div>
  );
};
