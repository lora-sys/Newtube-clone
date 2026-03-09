import { db } from "@/db/db";
import { subscriptions, users, videoReactions, videos, videosViews, videoUpdateSchema } from "@/db/schema";
import { mux } from "@/lib/mux";
import { workflow } from "@/lib/workflow";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { eq, and, getTableColumns, inArray, sql, lt, or, desc } from "drizzle-orm";
import { UTApi } from "uploadthing/server";
import { z } from "zod";

export const updateVideoSchema = videoUpdateSchema
  .omit({ id: true })
  .extend({ id: z.string() });

export const videosRouter = createTRPCRouter({
  // 首页视频流
  getMany: baseProcedure
    .input(
      z.object({
        categoryId: z.string().uuid().optional(),
        userId: z.string().uuid().optional(),
        cursor: z
          .object({
            id: z.string(),
            updateAt: z.date(),
          })
          .optional(),
        limit: z.number().min(1).max(100).default(10),
      })
    )
    .query(async ({ input }) => {
      const { categoryId, userId, cursor, limit } = input;

      const data = await db
        .select({
          id: videos.id,
          title: videos.title,
          thumbnailurl: videos.thumbnailurl,
          previewUrl: videos.previewUrl,
          duration: videos.duration,
          createAt: videos.createAt,
          updateAt: videos.updateAt,
          muxPlaybackId: videos.muxPlaybackId,
          description: videos.description,
          user: {
            id: users.id,
            name: users.name,
            imageUrl: users.imageUrl,
          },
          viewCount: db.$count(videosViews, eq(videosViews.videoId, videos.id)),
          likeCount: db.$count(
            videoReactions,
            and(
              eq(videoReactions.videoId, videos.id),
              eq(videoReactions.type, "like")
            )
          ),
        })
        .from(videos)
        .innerJoin(users, eq(videos.userId, users.id))
        .where(
          and(
            eq(videos.videoVisiblity, "public"),
            categoryId ? eq(videos.categoryId, categoryId) : undefined,
            userId ? eq(videos.userId, userId) : undefined,
            cursor
              ? or(
                  lt(videos.updateAt, cursor.updateAt),
                  and(
                    eq(videos.updateAt, cursor.updateAt),
                    lt(videos.id, cursor.id)
                  )
                )
              : undefined
          )
        )
        .orderBy(desc(videos.updateAt), desc(videos.id))
        .limit(limit + 1);

      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, -1) : data;
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? { id: lastItem.id, updateAt: lastItem.updateAt }
        : null;

      return { items, nextCursor };
    }),

  // 热门视频
  getTrending: baseProcedure
    .input(
      z.object({
        categoryId: z.string().uuid().optional(),
        cursor: z
          .object({
            id: z.string(),
            viewCount: z.number(),
          })
          .optional(),
        limit: z.number().min(1).max(100).default(10),
      })
    )
    .query(async ({ input }) => {
      const { categoryId, cursor, limit } = input;

      // 子��询获取观看数
      const videoViewsSubquery = db
        .select({
          videoId: videosViews.videoId,
          viewCount: sql<number>`count(*)`.as("view_count"),
        })
        .from(videosViews)
        .groupBy(videosViews.videoId)
        .as("video_views_count");

      const data = await db
        .select({
          id: videos.id,
          title: videos.title,
          thumbnailurl: videos.thumbnailurl,
          previewUrl: videos.previewUrl,
          duration: videos.duration,
          createAt: videos.createAt,
          updateAt: videos.updateAt,
          muxPlaybackId: videos.muxPlaybackId,
          description: videos.description,
          user: {
            id: users.id,
            name: users.name,
            imageUrl: users.imageUrl,
          },
          viewCount: sql<number>`coalesce(${videoViewsSubquery.viewCount}, 0)`,
          likeCount: db.$count(
            videoReactions,
            and(
              eq(videoReactions.videoId, videos.id),
              eq(videoReactions.type, "like")
            )
          ),
        })
        .from(videos)
        .innerJoin(users, eq(videos.userId, users.id))
        .leftJoin(videoViewsSubquery, eq(videos.id, videoViewsSubquery.videoId))
        .where(
          and(
            eq(videos.videoVisiblity, "public"),
            categoryId ? eq(videos.categoryId, categoryId) : undefined,
            cursor
              ? or(
                  lt(videoViewsSubquery.viewCount, cursor.viewCount),
                  and(
                    eq(videoViewsSubquery.viewCount, cursor.viewCount),
                    lt(videos.id, cursor.id)
                  )
                )
              : undefined
          )
        )
        .orderBy(desc(videoViewsSubquery.viewCount), desc(videos.id))
        .limit(limit + 1);

      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, -1) : data;
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? { id: lastItem.id, viewCount: lastItem.viewCount }
        : null;

      return { items, nextCursor };
    }),

  // 订阅视频
  getSubscriptions: protectedProcedure
    .input(
      z.object({
        cursor: z
          .object({
            id: z.string(),
            updateAt: z.date(),
          })
          .optional(),
        limit: z.number().min(1).max(100).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const { cursor, limit } = input;
      const { id: userId } = ctx.user;

      // 获取用户订阅的创作者 ID
      const userSubscriptions = await db
        .select({ creatorId: subscriptions.creatorId })
        .from(subscriptions)
        .where(eq(subscriptions.viewerId, userId));

      const creatorIds = userSubscriptions.map((sub) => sub.creatorId);

      if (creatorIds.length === 0) {
        return { items: [], nextCursor: null };
      }

      const data = await db
        .select({
          id: videos.id,
          title: videos.title,
          thumbnailurl: videos.thumbnailurl,
          previewUrl: videos.previewUrl,
          duration: videos.duration,
          createAt: videos.createAt,
          updateAt: videos.updateAt,
          muxPlaybackId: videos.muxPlaybackId,
          description: videos.description,
          user: {
            id: users.id,
            name: users.name,
            imageUrl: users.imageUrl,
          },
          viewCount: db.$count(videosViews, eq(videosViews.videoId, videos.id)),
          likeCount: db.$count(
            videoReactions,
            and(
              eq(videoReactions.videoId, videos.id),
              eq(videoReactions.type, "like")
            )
          ),
        })
        .from(videos)
        .innerJoin(users, eq(videos.userId, users.id))
        .where(
          and(
            eq(videos.videoVisiblity, "public"),
            inArray(videos.userId, creatorIds),
            cursor
              ? or(
                  lt(videos.updateAt, cursor.updateAt),
                  and(
                    eq(videos.updateAt, cursor.updateAt),
                    lt(videos.id, cursor.id)
                  )
                )
              : undefined
          )
        )
        .orderBy(desc(videos.updateAt), desc(videos.id))
        .limit(limit + 1);

      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, -1) : data;
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? { id: lastItem.id, updateAt: lastItem.updateAt }
        : null;

      return { items, nextCursor };
    }),

  getOne: baseProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const { clerkUserId } = ctx;

      // 只有登录用户才查询 userId
      let userId: string | undefined;
      if (clerkUserId) {
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.clerkId, clerkUserId));
        if (user) {
          userId = user.id;
        }
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

      // Note: trackId and trackStatus are updated via Mux webhook (video.track.ready event)

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
      cors_origin: process.env.MUX_CORS_ORIGIN || "*",
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

  // 删除视频（用于取消上传时清理）
  removeDraft: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { id: videoId } = input;

      const [video] = await db
        .select()
        .from(videos)
        .where(and(eq(videos.id, videoId), eq(videos.userId, userId)));

      if (!video) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Video not found" });
      }

      // 删除 Mux asset（如果存在）
      if (video.muxAssetId) {
        try {
          await mux.video.assets.delete(video.muxAssetId);
        } catch (error) {
          // 忽略删除错误，继续删除数据库记录
          console.error("Failed to delete Mux asset:", error);
        }
      }

      // 删除视频记录
      const [deleted] = await db
        .delete(videos)
        .where(eq(videos.id, videoId))
        .returning();

      return deleted;
    }),

});
