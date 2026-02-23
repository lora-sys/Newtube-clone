import { db } from "@/db/db";
import { videos, videoUpdateSchema } from "@/db/schema";
import { mux } from "@/lib/mux";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { eq, and } from "drizzle-orm";
import { UTApi } from "uploadthing/server";
import {  z } from "zod";

export const updateVideoSchema = videoUpdateSchema
  .omit({ id: true })
  .extend({ id: z.string() });

export const videosRouter = createTRPCRouter({
  restoreThumbnail: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;

      const [existingVideo] = await db
        .select()
        .from(videos)
        .where(and(eq(videos.id, input.id), eq(videos.userId, userId)));

      if (!existingVideo) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      if (existingVideo.thumbnailKey) {
        const utapi = new UTApi();

        await utapi.deleteFiles(existingVideo.thumbnailKey);
        await db
          .update(videos)
          .set({
            thumbnailKey: null,
            thumbnailurl: null,
          })
          .where(and(eq(videos.id, input.id), eq(videos.userId, userId)));
      }
      if (!existingVideo.muxPlaybackId) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }
      const utapi = new UTApi();
      const tempThumbnailurl = `https://image.mux.com/${existingVideo.muxPlaybackId}/thumbnail.jpg`;
      const uploadedThumbnail = await utapi.uploadFilesFromUrl(tempThumbnailurl);

      if (!uploadedThumbnail.data) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }

      const { key: thumbnailKey, ufsUrl: thumbnailurl } = uploadedThumbnail.data;

      const [updateVideo] = await db
        .update(videos)
        .set({ thumbnailKey, thumbnailurl })
        .where(and(eq(videos.id, input.id), eq(videos.userId, userId)))
        .returning();

      return updateVideo;
    }),

  remove: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;

      const [removeVideo] = await db
        .delete(videos)
        .where(and(eq(videos.id, input.id), eq(videos.userId, userId)))
        .returning();

      if (!removeVideo) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return removeVideo;
    }),
  update: protectedProcedure
    .input(updateVideoSchema)
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      if (!userId) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }
      const [updateVideo] = await db
        .update(videos)
        .set({
          title: input.title,
          description: input.description,
          categoryId: input.categoryId,
          videoVisiblity: input.videoVisiblity,
          updateAt: new Date(),
        })
        .where(and(eq(videos.id, input.id), eq(videos.userId, userId)))
        .returning()
        .execute();

      if (!updateVideo) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
    }),

  create: protectedProcedure.mutation(async ({ ctx }) => {
    const { id: userId } = ctx.user;
    const upload = await mux.video.uploads.create({
      new_asset_settings: {
        passthrough: userId,
        playback_policies: ["public"],
        inputs: [
          {
            generated_subtitles: [
              {
                language_code: "en",
                name: "English",
              },
            ],
          },
        ],
      },
      cors_origin: "*", // TODO: in productio , set your url
    });

    const [video] = await db
      .insert(videos)
      .values({
        userId,
        title: "undefined",
        muxStatus: "waiting",
        muxUploadId: upload.id,
      })
      .returning()
      .execute();

    return {
      video: video,
      url: upload.url,
    };
  }),
});
