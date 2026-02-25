"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";
import { Suspense, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  CopyCheckIcon,
  CopyIcon,
  Globe2Icon,
  ImagePlusIcon,
  Loader2Icon,
  LockIcon,
  MoreVerticalIcon,
  RotateCcwIcon,
  SparkleIcon,
  TrashIcon,
} from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormLabel,
  FormMessage,
  FormItem,
  FormField,
} from "@/components/ui/form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";
import { videoUpdateSchema } from "@/db/schema";
import { toast } from "sonner";
import { VideoPlayer } from "@/moubles/videos/ui/components/video-player";
import Link from "next/link";
import { snakeCaseToTitle } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { THUMBNAIL_FLLBACK } from "../constants";
import { ThumbnailUploadModal } from "../ui/components/thumbnail-upload-modal";
import { ThumbnailGenerateModal } from "../ui/components/thumbnail-generate-modal";
interface FormSectionProps {
  videoId: string;
}
import { Skeleton } from "@/components/ui/skeleton";
export const FormSection = ({ videoId }: FormSectionProps) => {
  return (
    <Suspense fallback={<FormSectionSkeleton />}>
      <ErrorBoundary fallback={<p>Error</p>}>
        <FormSectionSuspence videoId={videoId} />
      </ErrorBoundary>
    </Suspense>
  );
};

export const FormSectionSkeleton = () => {
  return (
    <div>
      {/* 头部 */}
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <Skeleton className="h-7 w-32"></Skeleton>
          <Skeleton className="h-4 w-40"></Skeleton>
        </div>
        <Skeleton className="h-9 w-24"></Skeleton>
      </div>

      {/* 网格布局 */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* 左侧 lg:col-span-3 */}
        <div className="space-y-6 lg:col-span-3">
          <div className="space-y-2">
            <Skeleton className="h-5 w-16"></Skeleton>
            <Skeleton className="h-10 w-full"></Skeleton>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-24"></Skeleton>
            <Skeleton className="h-[158px] w-full"></Skeleton>{" "}
            {/* rows=10 ≈ 158px */}
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-24"></Skeleton>
            <Skeleton className="h-[90px] w-[160px]"></Skeleton>{" "}
            {/* Thumbnail 尺寸 */}
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-16"></Skeleton>
            <Skeleton className="h-10 w-full"></Skeleton>
          </div>
        </div>

        {/* 右侧 lg:col-span-2 */}
        <div className="space-y-6 lg:col-span-2">
          {/* 视频播放器区域 */}
          <div className="bg-[#F9F9F9] rounded-xl overflow-hidden h-fit">
            <Skeleton className="aspect-video w-full"></Skeleton>
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-3 w-20"></Skeleton>
                <Skeleton className="h-4 w-full"></Skeleton>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-24"></Skeleton>
                <Skeleton className="h-4 w-32"></Skeleton>
              </div>
            </div>
          </div>

          {/* Visibility */}
          <div className="space-y-2">
            <Skeleton className="h-5 w-20"></Skeleton>
            <Skeleton className="h-10 w-full"></Skeleton>
          </div>
        </div>
      </div>
    </div>
  );
};

export const FormSectionSuspence = ({ videoId }: FormSectionProps) => {
  const router = useRouter();
  const [video] = trpc.studio.getOne.useSuspenseQuery({ id: videoId });
  const [categories] = trpc.categories.getMany.useSuspenseQuery();
  const [thumbnailModalOpen, setThumbnailModalOpen] = useState(false);
  const [thumbnailGeneratedModalOpen, setThumbnailGeneratedModalOpen] =
    useState(false);
  const update = trpc.videos.update.useMutation({
    onSuccess: () => {
      utils.studio.getMany.invalidate();
      utils.studio.getOne.invalidate({ id: videoId });
      toast.success("video updated");
    },
    onError: () => {
      toast.error("something wrong");
    },
  });
  const remove = trpc.videos.remove.useMutation({
    onSuccess: () => {
      utils.studio.getMany.invalidate();
      toast.success("video removed");
      router.push("/studio");
    },
    onError: () => {
      toast.error("something wrong");
    },
  });

  const restore = trpc.videos.restoreThumbnail.useMutation({
    onSuccess: () => {
      utils.studio.getMany.invalidate();
      utils.studio.getOne.invalidate({ id: videoId });
      toast.success("Thumbnail restored");
      router.push("/studio");
    },
    onError: () => {
      toast.error("something wrong");
    },
  });
  const generateTitle = trpc.videos.generateTitle.useMutation({
    onSuccess: () => {
      toast.success("background job started", {
        description: "this is may take some times ",
      });
      const interval = setInterval(() => {
        utils.studio.getOne.invalidate({ id: videoId });
      }, 2000);
      setTimeout(() => clearInterval(interval), 60000);
    },
    onError: () => {
      toast.error("something wrong");
    },
  });
  const generateDescription = trpc.videos.generateDescription.useMutation({
    onSuccess: () => {
      toast.success("background job started", {
        description: "this is may take some times ",
      });
      const interval = setInterval(() => {
        utils.studio.getOne.invalidate({ id: videoId });
      }, 2000);
      setTimeout(() => clearInterval(interval), 60000);
    },
    onError: () => {
      toast.error("something wrong");
    },
  });

  const form = useForm<z.infer<typeof videoUpdateSchema>>({
    resolver: zodResolver(videoUpdateSchema),
    defaultValues: video,
  });
  const utils = trpc.useUtils();
  const onSubmit = async (data: z.infer<typeof videoUpdateSchema>) => {
    update.mutate({ ...data, id: videoId });
  };

  const fullUrl = `${process.env.VERCEL_URL || "http://localhost:3000"}/videos/${videoId} `;
  const [isCopied, setIsCopied] = useState(false);

  const onCopy = async () => {
    await navigator.clipboard.writeText(fullUrl);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 20000);
  };

  return (
    <>
      <ThumbnailUploadModal
        open={thumbnailModalOpen}
        onOpenChange={setThumbnailModalOpen}
        videoId={videoId}
      />
      <ThumbnailGenerateModal
        open={thumbnailGeneratedModalOpen}
        onOpenChange={setThumbnailGeneratedModalOpen}
        videoId={videoId}
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex items-center justify-between mb-6 ">
            <div>
              <h1 className="text-2xl font-bold">video details</h1>
              <h1 className="text-xs text-muted-foreground">
                manage your video details
              </h1>
            </div>

            <div className="flex items-center gap-x-2">
              <Button type="submit" disabled={update.isPending}>
                Save
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVerticalIcon />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => remove.mutate({ id: videoId })}
                  >
                    <TrashIcon className="size-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="grid grid-col-1 lg:grid-cols-5 gap-6">
            <div className="sapce-y-8 lg:col-span-3">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <div className="flex items-center gap-x-2 ">
                        Title
                        <Button
                          size="icon"
                          type="submit"
                          variant="outline"
                          className="rounded-full size-6 [&_svg]:size-3"
                          onClick={() => generateTitle.mutate({ id: videoId })}
                          disabled={
                            generateTitle.isPending || !video.muxTrackId
                          }
                        >
                          {generateTitle.isPending ? (
                            <Loader2Icon className="animate-spin" />
                          ) : (
                            <SparkleIcon />
                          )}
                        </Button>
                      </div>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="add title to your video" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              ></FormField>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <div className="flex items-center gap-x-2 ">
                        Description
                        <Button
                          size="icon"
                          type="submit"
                          variant="outline"
                          className="rounded-full size-6 [&_svg]:size-3"
                          onClick={() =>
                            generateDescription.mutate({ id: videoId })
                          }
                          disabled={
                            generateDescription.isPending || !video.muxTrackId
                          }
                        >
                          {generateDescription.isPending ? (
                            <Loader2Icon className="animate-spin" />
                          ) : (
                            <SparkleIcon />
                          )}
                        </Button>
                      </div>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={10}
                        value={field.value ?? ""}
                        className="resize-none pr-10"
                        placeholder="add description to your video "
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              ></FormField>
              {/** add thumbnail filed here */}

              <FormField
                control={form.control}
                name="thumbnailurl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thumbnail</FormLabel>
                    <FormControl>
                      <div className="p-0.5 border border-dashed border-neutral-400 relative h-[90px] w-[160px] group">
                        <Image
                          src={field.value || THUMBNAIL_FLLBACK}
                          fill
                          alt="Thumbnail"
                          className="object-cover"
                        />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              type="button"
                              size="icon"
                              className="bg-black/50 hover:bg-black/50 absolute top-1 right-1 rounded-full opacity-100 md:opacity-0 group-hover:opacity-100 duration-300 size-7"
                            >
                              <MoreVerticalIcon className="size-4 text-white" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            side="right"
                            sideOffset={4}
                          >
                            <DropdownMenuItem
                              onClick={() => setThumbnailModalOpen(true)}
                            >
                              <ImagePlusIcon className="size-4 mr-1" />
                              change
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => {
                                setThumbnailGeneratedModalOpen(true);
                              }}
                            >
                              <SparkleIcon className="size-4 mr-1" />
                              ai-generated
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() =>
                                restore.mutate({
                                  id: videoId,
                                })
                              }
                            >
                              <RotateCcwIcon className="size-4 mr-1" />
                              restore
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value ?? undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem value={category.id} key={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              ></FormField>
            </div>

            <div className="flex flex-col gap-y-8 lg:col-span-2">
              <div className="flex flex-col gap-4 bg-[#F9F9F9] rouned-xl overflow-hidden h-fit">
                <div className="aspect-video overflow-hidden relative">
                  <VideoPlayer
                    playbackId={video.muxPlaybackId}
                    thumbnailUrl={video.thumbnailurl}
                  />
                </div>
                <div className="p-4 flex flex-col gap-y-6">
                  <div className="flex justify-between items-center gap-x-2">
                    <div className="flex flex-col gap-y-1 ">
                      <p className="text-muted-foreground text-xs">
                        Video link
                      </p>
                      <div className="flex items-center gap-x-2">
                        <Link href={`/videos/${video.id}`}>
                          <p className="line-clamp-1 text-sm text-blue-500">
                            {fullUrl}
                          </p>
                        </Link>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="shrink-0"
                          onClick={onCopy}
                          disabled={isCopied}
                        >
                          {isCopied ? <CopyCheckIcon /> : <CopyIcon />}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-y-1">
                      <p className="text-muted-foreground text-xs ">
                        Subtitle status
                      </p>

                      <p className="text-sm">
                        {snakeCaseToTitle(
                          video.muxTrackStatus || "no_subtitle",
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <FormField
                control={form.control}
                name="videoVisiblity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visibility</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value ?? undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a visibility" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="public">
                          <div className="flex items-center">
                            <Globe2Icon className="size-4 mr-2" />
                            Public
                          </div>
                        </SelectItem>
                        <SelectItem value="private">
                          <div className="flex items-center">
                            <LockIcon className="size-4 mr-2" />
                            Private
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Public videos can be viewed by anyone. Private videos are
                      only accessible to you.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              ></FormField>
            </div>
          </div>
        </form>
      </Form>
    </>
  );
};
