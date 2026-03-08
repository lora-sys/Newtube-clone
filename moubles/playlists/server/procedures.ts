import { db } from "@/db/db";
import { users, videos, videosViews, videoReactions, playlists, playlistVideos, watchLater } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { z } from "zod";
import { eq, and, desc, getTableColumns, lt, sql } from "drizzle-orm";

export const playlistsRouter = createTRPCRouter({
  // 获取用户的播放列表
  getMany: protectedProcedure
    .input(
      z.object({
        cursor: z.string().optional(),
        limit: z.number().min(1).max(100).default(12),
      })
    )
    .query(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { cursor, limit } = input;

      const data = await db
        .select({
          ...getTableColumns(playlists),
          videoCount: db.$count(playlistVideos, eq(playlistVideos.playlistId, playlists.id)),
        })
        .from(playlists)
        .where(
          and(
            eq(playlists.userId, userId),
            cursor ? lt(playlists.id, cursor) : undefined
          )
        )
        .orderBy(desc(playlists.createAt))
        .limit(limit + 1);

      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, -1) : data;

      // 获取每个播放列表的前4个视频缩略图
      const playlistsWithThumbnails = await Promise.all(
        items.map(async (playlist) => {
          const thumbnailData = await db
            .select({ thumbnailurl: videos.thumbnailurl })
            .from(playlistVideos)
            .innerJoin(videos, eq(playlistVideos.videoId, videos.id))
            .where(eq(playlistVideos.playlistId, playlist.id))
            .orderBy(desc(playlistVideos.createAt))
            .limit(4);

          return {
            ...playlist,
            thumbnails: thumbnailData.map((t) => t.thumbnailurl),
          };
        })
      );

      const lastItem = items[items.length - 1];
      const nextCursor = hasMore ? lastItem?.id : null;

      return { items: playlistsWithThumbnails, nextCursor };
    }),

  // 获取播放列表详情（包含视频）
  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { id: playlistId } = input;

      const [playlist] = await db
        .select()
        .from(playlists)
        .where(and(eq(playlists.id, playlistId), eq(playlists.userId, userId)));

      if (!playlist) {
        throw new Error("Playlist not found");
      }

      // 获取播放列表中的视频
      const playlistVideoData = await db
        .select({
          ...getTableColumns(videos),
          user: getTableColumns(users),
          viewCount: db.$count(videosViews, eq(videosViews.videoId, videos.id)),
          likeCount: db.$count(
            videoReactions,
            and(eq(videoReactions.videoId, videos.id), eq(videoReactions.type, "like"))
          ),
          addedAt: playlistVideos.createAt,
        })
        .from(playlistVideos)
        .innerJoin(videos, eq(playlistVideos.videoId, videos.id))
        .innerJoin(users, eq(videos.userId, users.id))
        .where(eq(playlistVideos.playlistId, playlistId))
        .orderBy(desc(playlistVideos.createAt));

      return {
        ...playlist,
        videos: playlistVideoData,
        videoCount: playlistVideoData.length,
      };
    }),

  // 创建播放列表
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        description: z.string().optional(),
        visibility: z.enum(["private", "public"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;

      const [playlist] = await db
        .insert(playlists)
        .values({
          userId,
          name: input.name,
          description: input.description,
          visibility: input.visibility || "private",
        })
        .returning();

      return playlist;
    }),

  // 更新播放列表
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(100).optional(),
        description: z.string().optional(),
        visibility: z.enum(["private", "public"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { id: playlistId, ...updateData } = input;

      const [updated] = await db
        .update(playlists)
        .set({
          ...updateData,
          updateAt: new Date(),
        })
        .where(and(eq(playlists.id, playlistId), eq(playlists.userId, userId)))
        .returning();

      if (!updated) {
        throw new Error("Playlist not found");
      }

      return updated;
    }),

  // 删除播放列表
  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { id: playlistId } = input;

      const [deleted] = await db
        .delete(playlists)
        .where(and(eq(playlists.id, playlistId), eq(playlists.userId, userId)))
        .returning();

      if (!deleted) {
        throw new Error("Playlist not found");
      }

      return deleted;
    }),

  // 添加视频到播放列表
  addVideo: protectedProcedure
    .input(
      z.object({
        playlistId: z.string(),
        videoId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { playlistId, videoId } = input;

      // 检查播放列表所有权
      const [playlist] = await db
        .select()
        .from(playlists)
        .where(and(eq(playlists.id, playlistId), eq(playlists.userId, userId)));

      if (!playlist) {
        throw new Error("Playlist not found");
      }

      // 检查视频是否已在播放列表中
      const [existing] = await db
        .select()
        .from(playlistVideos)
        .where(
          and(eq(playlistVideos.playlistId, playlistId), eq(playlistVideos.videoId, videoId))
        );

      if (existing) {
        return existing; // 已存在，不重复添加
      }

      const [added] = await db
        .insert(playlistVideos)
        .values({ playlistId, videoId })
        .returning();

      return added;
    }),

  // 从播放列表移除视频
  removeVideo: protectedProcedure
    .input(
      z.object({
        playlistId: z.string(),
        videoId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { playlistId, videoId } = input;

      // 检查播放列表所有权
      const [playlist] = await db
        .select()
        .from(playlists)
        .where(and(eq(playlists.id, playlistId), eq(playlists.userId, userId)));

      if (!playlist) {
        throw new Error("Playlist not found");
      }

      const [deleted] = await db
        .delete(playlistVideos)
        .where(
          and(eq(playlistVideos.playlistId, playlistId), eq(playlistVideos.videoId, videoId))
        )
        .returning();

      return deleted;
    }),

  // 观看历史
  getHistory: protectedProcedure
    .input(
      z.object({
        cursor: z
          .object({
            createAt: z.date(),
            videoId: z.string(),
          })
          .optional(),
        limit: z.number().min(1).max(100).default(12),
      })
    )
    .query(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { cursor, limit } = input;

      const data = await db
        .select({
          ...getTableColumns(videos),
          user: getTableColumns(users),
          viewedAt: videosViews.createAt,
          viewCount: db.$count(videosViews, eq(videosViews.videoId, videos.id)),
          likeCount: db.$count(
            videoReactions,
            and(eq(videoReactions.videoId, videos.id), eq(videoReactions.type, "like"))
          ),
        })
        .from(videosViews)
        .innerJoin(videos, eq(videosViews.videoId, videos.id))
        .innerJoin(users, eq(videos.userId, users.id))
        .where(
          and(
            eq(videosViews.userId, userId),
            cursor ? lt(videosViews.createAt, cursor.createAt) : undefined
          )
        )
        .orderBy(desc(videosViews.createAt))
        .limit(limit + 1);

      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, -1) : data;

      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? { createAt: lastItem.viewedAt, videoId: lastItem.id }
        : null;

      return { items, nextCursor };
    }),

  // 点赞视频
  getLiked: protectedProcedure
    .input(
      z.object({
        cursor: z
          .object({
            createAt: z.date(),
            videoId: z.string(),
          })
          .optional(),
        limit: z.number().min(1).max(100).default(12),
      })
    )
    .query(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { cursor, limit } = input;

      const data = await db
        .select({
          ...getTableColumns(videos),
          user: getTableColumns(users),
          likedAt: videoReactions.createAt,
          viewCount: db.$count(videosViews, eq(videosViews.videoId, videos.id)),
          likeCount: db.$count(
            videoReactions,
            and(eq(videoReactions.videoId, videos.id), eq(videoReactions.type, "like"))
          ),
        })
        .from(videoReactions)
        .innerJoin(videos, eq(videoReactions.videoId, videos.id))
        .innerJoin(users, eq(videos.userId, users.id))
        .where(
          and(
            eq(videoReactions.userId, userId),
            eq(videoReactions.type, "like"),
            cursor ? lt(videoReactions.createAt, cursor.createAt) : undefined
          )
        )
        .orderBy(desc(videoReactions.createAt))
        .limit(limit + 1);

      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, -1) : data;

      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? { createAt: lastItem.likedAt, videoId: lastItem.id }
        : null;

      return { items, nextCursor };
    }),

  // 点赞视频预览（首页用）
  getLikedPreview: protectedProcedure
    .query(async ({ ctx }) => {
      const { id: userId } = ctx.user;

      const [countResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(videoReactions)
        .where(and(eq(videoReactions.userId, userId), eq(videoReactions.type, "like")));

      const thumbnails = await db
        .select({ thumbnailurl: videos.thumbnailurl })
        .from(videoReactions)
        .innerJoin(videos, eq(videoReactions.videoId, videos.id))
        .where(and(eq(videoReactions.userId, userId), eq(videoReactions.type, "like")))
        .orderBy(desc(videoReactions.createAt))
        .limit(4);

      return {
        count: countResult?.count || 0,
        thumbnails: thumbnails.map((t) => t.thumbnailurl),
      };
    }),

  // ========== Watch Later ==========

  // 稍后观看列表
  getWatchLater: protectedProcedure
    .input(
      z.object({
        cursor: z.date().optional(),
        limit: z.number().min(1).max(100).default(12),
      })
    )
    .query(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { cursor, limit } = input;

      const data = await db
        .select({
          ...getTableColumns(videos),
          user: getTableColumns(users),
          addedAt: watchLater.createAt,
          viewCount: db.$count(videosViews, eq(videosViews.videoId, videos.id)),
          likeCount: db.$count(
            videoReactions,
            and(eq(videoReactions.videoId, videos.id), eq(videoReactions.type, "like"))
          ),
        })
        .from(watchLater)
        .innerJoin(videos, eq(watchLater.videoId, videos.id))
        .innerJoin(users, eq(videos.userId, users.id))
        .where(
          and(
            eq(watchLater.userId, userId),
            cursor ? lt(watchLater.createAt, cursor) : undefined
          )
        )
        .orderBy(desc(watchLater.createAt))
        .limit(limit + 1);

      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, -1) : data;

      const lastItem = items[items.length - 1];
      const nextCursor = hasMore ? lastItem?.addedAt : null;

      return { items, nextCursor };
    }),

  // 稍后观看预览
  getWatchLaterPreview: protectedProcedure
    .query(async ({ ctx }) => {
      const { id: userId } = ctx.user;

      const [countResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(watchLater)
        .where(eq(watchLater.userId, userId));

      const thumbnails = await db
        .select({ thumbnailurl: videos.thumbnailurl })
        .from(watchLater)
        .innerJoin(videos, eq(watchLater.videoId, videos.id))
        .where(eq(watchLater.userId, userId))
        .orderBy(desc(watchLater.createAt))
        .limit(4);

      return {
        count: countResult?.count || 0,
        thumbnails: thumbnails.map((t) => t.thumbnailurl),
      };
    }),

  // 添加到稍后观看
  addToWatchLater: protectedProcedure
    .input(z.object({ videoId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { videoId } = input;

      const [existing] = await db
        .select()
        .from(watchLater)
        .where(and(eq(watchLater.userId, userId), eq(watchLater.videoId, videoId)));

      if (existing) return existing;

      const [added] = await db
        .insert(watchLater)
        .values({ userId, videoId })
        .returning();

      return added;
    }),

  // 从稍后观看移除
  removeFromWatchLater: protectedProcedure
    .input(z.object({ videoId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { videoId } = input;

      const [deleted] = await db
        .delete(watchLater)
        .where(and(eq(watchLater.userId, userId), eq(watchLater.videoId, videoId)))
        .returning();

      return deleted;
    }),

  // ========== Playlist Modal ==========

  // 获取用户的播放列表（用于添加视频模态框）
  getManyForVideo: protectedProcedure
    .input(z.object({ videoId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { videoId } = input;

      // 获取用户所有播放列表
      const userPlaylists = await db
        .select({
          ...getTableColumns(playlists),
          videoCount: db.$count(playlistVideos, eq(playlistVideos.playlistId, playlists.id)),
        })
        .from(playlists)
        .where(eq(playlists.userId, userId))
        .orderBy(desc(playlists.createAt));

      // 获取视频已所在的播放列表 ID
      const videoInPlaylists = await db
        .select({ playlistId: playlistVideos.playlistId })
        .from(playlistVideos)
        .where(eq(playlistVideos.videoId, videoId));

      const playlistIds = new Set(videoInPlaylists.map((v) => v.playlistId));

      return userPlaylists.map((playlist) => ({
        ...playlist,
        containsVideo: playlistIds.has(playlist.id),
      }));
    }),
});
