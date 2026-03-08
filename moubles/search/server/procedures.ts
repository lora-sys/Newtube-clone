import { db } from "@/db/db";
import { users, videos, videosViews, videoReactions } from "@/db/schema";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { and, desc, eq, lt, or, and as sqlAnd, sql } from "drizzle-orm";
import { z } from "zod";

export const searchRouter = createTRPCRouter({
  getMany: baseProcedure
    .input(
      z.object({
        query: z.string().min(1).max(100),
        categoryId: z.string().uuid().optional(),
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
      const { query, categoryId, cursor, limit } = input;

      // 模糊搜索视频标题和描述
      const searchPattern = `%${query}%`;

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
            or(
              sql`${videos.title} ILIKE ${searchPattern}`,
              sql`${videos.description} ILIKE ${searchPattern}`
            ),
            categoryId ? eq(videos.categoryId, categoryId) : undefined,
            cursor
              ? or(
                  lt(videos.updateAt, cursor.updateAt),
                  sqlAnd(
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
});
