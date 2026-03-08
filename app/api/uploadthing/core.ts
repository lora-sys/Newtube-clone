import { db } from "@/db/db";
import { users, videos } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError, UTApi } from "uploadthing/server";
import z from "zod";

const f = createUploadthing();

export const ourFileRouter = {
  ThumbnailUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .input(
      z.object({
        videoId: z.string(),
      }),
    )
    .middleware(async ({ input }) => {
      const { userId: clerkUserId } = await auth();

      if (!clerkUserId) throw new UploadThingError("Unauthorized");

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, clerkUserId));
      if (!user) throw new UploadThingError("Unauthorized");
      const [existingVideo] = await db
        .select({
          thumbnailKey: videos.thumbnailKey,
        })
        .from(videos)
        .where(and(eq(videos.id, input.videoId), eq(videos.userId, user.id)));

      if (!existingVideo) throw new UploadThingError("Bad request");
      if (existingVideo.thumbnailKey) {
        const utapi = new UTApi();

        await utapi.deleteFiles(existingVideo.thumbnailKey);
        await db
          .update(videos)
          .set({
            thumbnailKey: null,
            thumbnailurl: null,
          })
          .where(and(eq(videos.id, input.videoId), eq(videos.userId, user.id)));
      }

      return { userId: user.id, ...input };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await db
        .update(videos)
        .set({
          thumbnailurl: file.ufsUrl,
          thumbnailKey: file.key,
        })
        .where(
          and(
            eq(videos.id, metadata.videoId),
            eq(videos.userId, metadata.userId),
          ),
        );

      return { uploadedBy: metadata.userId };
    }),

  BannerUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      const { userId: clerkUserId } = await auth();

      if (!clerkUserId) throw new UploadThingError("Unauthorized");

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, clerkUserId));

      if (!user) throw new UploadThingError("Unauthorized");

      // 删除旧 banner
      if (user.bannerKey) {
        const utapi = new UTApi();
        await utapi.deleteFiles(user.bannerKey);
      }

      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await db
        .update(users)
        .set({
          bannerUrl: file.ufsUrl,
          bannerKey: file.key,
        })
        .where(eq(users.id, metadata.userId));

      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
