import { db } from "@/db/db";
import { videos, videosViews, videoReactions, comments } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { z } from "zod";
import { eq, and, or, lt, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const studioRouter = createTRPCRouter({
  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { id } = input;
      const [video] = await db
        .select()
        .from(videos)
        .where(and(eq(videos.id, id), eq(videos.userId, userId)));

      if (!video) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Get real-time stats
      const viewCount = db.$count(videosViews, eq(videosViews.videoId, video.id));
      const likeCount = db.$count(videoReactions, and(
        eq(videoReactions.videoId, video.id),
        eq(videoReactions.type, "like")
      ));
      const dislikeCount = db.$count(videoReactions, and(
        eq(videoReactions.videoId, video.id),
        eq(videoReactions.type, "dislike")
      ));
      const commentCount = db.$count(comments, eq(comments.videoId, video.id));

      return {
        ...video,
        viewCount,
        likeCount,
        dislikeCount,
        commentCount,
      };
    }),
  getMany: protectedProcedure
    .input(
      z.object({
        cursor: z
          .object({
            id: z.string(),
            updateAt: z.date(),
          })
          .nullish(),
        limit: z.number().min(1).max(100),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { cursor, limit } = input;
      const { id: userId } = ctx.user;
      const data = await db
        .select()
        .from(videos)
        .where(
          and(
            eq(videos.userId, userId),
            cursor
              ? or(
                  lt(videos.updateAt, cursor.updateAt),
                  and(
                    eq(videos.updateAt, cursor.updateAt),
                    lt(videos.id, cursor.id),
                  ),
                )
              : undefined,
          ),
        )
        .orderBy(desc(videos.updateAt), desc(videos.id))
        .limit(limit + 1);

      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, -1) : data;

      // Add real-time stats for each video
      const itemsWithStats = await Promise.all(
        items.map(async (video) => ({
          ...video,
          viewCount: await db.$count(videosViews, eq(videosViews.videoId, video.id)),
          likeCount: await db.$count(videoReactions, and(
            eq(videoReactions.videoId, video.id),
            eq(videoReactions.type, "like")
          )),
          commentCount: await db.$count(comments, eq(comments.videoId, video.id)),
        }))
      );

      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? {
            id: lastItem.id,
            updateAt: lastItem.updateAt,
          }
        : null;

      return {
        items: itemsWithStats,
        nextCursor,
      };
    }),
});