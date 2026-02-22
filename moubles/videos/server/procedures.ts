import { db } from "@/db/db";
import { videos, videoUpdateSchema } from "@/db/schema";
import { mux } from "@/lib/mux";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

export const updateVideoSchema = videoUpdateSchema
  .omit({ id: true })
  .extend({ id: z.string() });

export const videosRouter = createTRPCRouter({
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
