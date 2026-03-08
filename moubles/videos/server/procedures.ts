import { db } from "@/db/db";
import { subscriptions, users, videoReactions, videos, videosViews, videoUpdateSchema } from "@/db/schema";
import { mux } from "@/lib/mux";
import { workflow } from "@/lib/workflow";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { eq, and, getTableColumns, inArray, sql } from "drizzle-orm";
import { UTApi } from "uploadthing/server";
import { z } from "zod";

export const updateVideoSchema = videoUpdateSchema
  .omit({ id: true })
  .extend({ id: z.string() });

export const videosRouter = createTRPCRouter({
  getOne: baseProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const { clerkUserId } = ctx;

      let userId: string | undefined;
      const [user] = await db
        .select()
        .from(users)
        .where(
          inArray(users.clerkId, clerkUserId ? [clerkUserId] : [])
        );

      if (user) {
        userId = user.id;
      }

      // CTE for viewer reactions
      const viewerReactions = db.$with("viewer_reactions").as(
        db
          .select({
            videoId: videoReactions.videoId,
            type: videoReactions.type,
          })
          .from(videoReactions)
          .where(inArray(videoReactions.userId, userId ? [userId] : []))
      );

      // CTE for viewer subscriptions
      const viewerSubscriptions = db.$with("viewer_subscriptions").as(
        db
          .select({
            creatorId: subscriptions.creatorId,
          })
          .from(subscriptions)
          .where(inArray(subscriptions.viewerId, userId ? [userId] : []))
      );

      const [existingVideo] = await db
        .with(viewerReactions, viewerSubscriptions)
        .select(
          {
            ...getTableColumns(videos),
            user: {
              ...getTableColumns(users)
            },
            videoCount: db.$count(videosViews, eq(videosViews.videoId, videos.id)),
            likeCount: db.$count(videoReactions,
              and(
                eq(videoReactions.videoId, videos.id),
                eq(videoReactions.type, "like"),
              )
            ),
            dislikeCount: db.$count(videoReactions,
              and(
                eq(videoReactions.videoId, videos.id),
                eq(videoReactions.type, "dislike"),
              )
            ),
            viewerReaction: viewerReactions.type,
            subscriberCount: db.$count(subscriptions, eq(subscriptions.creatorId, videos.userId)),
            isSubscribed: sql<boolean>`${viewerSubscriptions.creatorId} IS NOT NULL`.as("is_subscribed"),
          }
        )
        .from(videos)
        .innerJoin(users, eq(videos.userId, users.id))
        .leftJoin(viewerReactions, eq(viewerReactions.videoId, videos.id))
        .leftJoin(viewerSubscriptions, eq(viewerSubscriptions.creatorId, videos.userId))
        .where(eq(videos.id, input.id));

      if (!existingVideo) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return existingVideo;
    }),
  generateDescription: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;

      const { workflowRunId } = await workflow.trigger({
        url: `${process.env.QSTASH_WORKFLOW_URL}/api/videos/workflows/description`,
        body: { userId, videoId: input.id },
      });
      return workflowRunId;
    }),
  generateTitle: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;

      const { workflowRunId } = await workflow.trigger({
        url: `${process.env.QSTASH_WORKFLOW_URL}/api/videos/workflows/title`,
        body: { userId, videoId: input.id },
      });
      return workflowRunId;
    }),
  generateThumbnail: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        prompt: z.string().min(10).max(500),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;

      const { workflowRunId } = await workflow.trigger({
        url: `${process.env.QSTASH_WORKFLOW_URL}/api/videos/workflows/thumbnail`,
        body: { userId, videoId: input.id, prompt: input.prompt },
      });
      return workflowRunId;
    }),
  revalidate: protectedProcedure
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
        throw new TRPCError({ code: "NOT_FOUND" })
      }
      if (!existingVideo.muxUploadId) {
        throw new TRPCError({ code: "BAD_GATEWAY" })
      }

      const directUpload = await mux.video.uploads.retrieve(
        existingVideo.muxUploadId
      )

      if (!directUpload || !directUpload.asset_id) {
        throw new TRPCError({ code: "BAD_GATEWAY" })
      }

      const asset = await mux.video.assets.retrieve(
        directUpload.asset_id
      )


      if (!asset) {
        throw new TRPCError({ code: "BAD_GATEWAY" })
      }

      const playbackId = asset.playback_ids?.[0].id;

      if (!playbackId) {
        throw new TRPCError({ code: "BAD_GATEWAY" })
      }
      const duration = asset?.duration ? Math.round(asset.duration) : 0;

      const updatedVideo = await db
        .update(videos)
        .set({
          muxStatus: asset.status,
          muxPlaybackId: playbackId,
          muxAssetId: asset.id,
          duration
        })
        .where(
          and(
            eq(videos.id, input.id),
            eq(videos.userId, userId)
          )
        )
        .returning();


      return updatedVideo;
    }),
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
      const uploadedThumbnail =
        await utapi.uploadFilesFromUrl(tempThumbnailurl);

      if (!uploadedThumbnail.data) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }

      const { key: thumbnailKey, ufsUrl: thumbnailurl } =
        uploadedThumbnail.data;

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
