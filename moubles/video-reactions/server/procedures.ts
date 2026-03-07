import { db } from "@/db/db";
import { videoReactions } from "@/db/schema";
import {  createTRPCRouter, protectedProcedure } from "@/trpc/init";
import z from "zod";
import { eq, and } from "drizzle-orm";




export const videoReactionsRouter = createTRPCRouter({
    like: protectedProcedure
        .input(z.object({ videoId: z.string() }))
        .mutation(async ({ input, ctx }) => {
            const { videoId } = input;
            const { id: userId } = ctx.user;

            const [existingvideoReactionLike] = await db
                .select()
                .from(videoReactions)
                .where(
                    and(
                        eq(videoReactions.videoId, videoId),
                        eq(videoReactions.userId, userId),
                        eq(videoReactions.type, "like")
                    )
                )
            // 已有点赞 -> 撤销点赞（删除）。
            // 已有踩 -> 变成点赞（更新）。 
            // 啥也没有 -> 点赞（插入）。    

            if (existingvideoReactionLike) {
                const [deleteViewerReaction] = await db
                    .delete(videoReactions)
                    .where(
                        and(
                            eq(videoReactions.userId, userId),
                            eq(videoReactions.videoId, videoId)
                        )
                    )
                    .returning();

                return deleteViewerReaction;
            }
            const [createVideoReaction] = await db
                .insert(videoReactions)
                .values({ userId, videoId, type: "like" })
                .onConflictDoUpdate({
                    target: [videoReactions.userId, videoReactions.videoId],
                    set: {
                        type: "like",
                    }
                })
                .returning();

            return createVideoReaction;

        }),
    dislike: protectedProcedure
        .input(z.object({ videoId: z.string() }))
        .mutation(async ({ input, ctx }) => {
            const { videoId } = input;
            const { id: userId } = ctx.user;

            const [existingvideoReactionDislike] = await db
                .select()
                .from(videoReactions)
                .where(
                    and(
                        eq(videoReactions.videoId, videoId),
                        eq(videoReactions.userId, userId),
                        eq(videoReactions.type, "dislike")
                    )
                )

            if (existingvideoReactionDislike) {
                const [deleteViewerReaction] = await db
                    .delete(videoReactions)
                    .where(
                        and(
                            eq(videoReactions.userId, userId),
                            eq(videoReactions.videoId, videoId)
                        )
                    )
                    .returning();

                return deleteViewerReaction;
            }
            const [createVideoReaction] = await db
                .insert(videoReactions)
                .values({ userId, videoId, type: "dislike" })
                .onConflictDoUpdate({
                    target: [videoReactions.userId, videoReactions.videoId],
                    set: {
                        type: "dislike",
                    }
                })
                .returning();

            return createVideoReaction;

        })
})