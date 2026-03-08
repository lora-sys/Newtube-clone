import { db } from "@/db/db";
import { users, videos,  subscriptions } from "@/db/schema";
import { createTRPCRouter, baseProcedure } from "@/trpc/init";
import { z } from "zod";
import { eq, and, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const usersRouter = createTRPCRouter({
  // 获取用户信息
  getOne: baseProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      const { id: userId } = input;

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      // 获取视频数量
      const [videoCountResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(videos)
        .where(and(eq(videos.userId, userId), eq(videos.videoVisiblity, "public")));

      // 获取订阅者数量
      const [subscriberCountResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(subscriptions)
        .where(eq(subscriptions.creatorId, userId));

      // 获取总观看量
      const [viewCountResult] = await db
        .select({ count: sql<number>`coalesce(sum(v.views), 0)` })
        .from(videos)
        .leftJoin(
          sql `(SELECT video_id, count(*) as views FROM video_views GROUP BY video_id) v`,
          sql`v.video_id = ${videos.id}`
        )
        .where(and(eq(videos.userId, userId), eq(videos.videoVisiblity, "public")));

      return {
        ...user,
        videoCount: videoCountResult?.count || 0,
        subscriberCount: subscriberCountResult?.count || 0,
        totalViewCount: viewCountResult?.count || 0,
      };
    }),
});
