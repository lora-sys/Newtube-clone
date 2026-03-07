import { db } from "@/db/db";
import { commentReactions } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

export const commentReactionsRouter = createTRPCRouter({
    like: protectedProcedure
        .input(z.object({ commentId: z.string() }))
        .mutation(async ({ input, ctx }) => {
            const { commentId } = input;
            const { id: userId } = ctx.user;

            const [existingReaction] = await db
                .select()
                .from(commentReactions)
                .where(
                    and(
                        eq(commentReactions.userId, userId),
                        eq(commentReactions.commentId, commentId)
                    )
                );

            if (existingReaction?.type === "like") {
                // 如果已经点赞，则取消
                await db
                    .delete(commentReactions)
                    .where(
                        and(
                            eq(commentReactions.userId, userId),
                            eq(commentReactions.commentId, commentId)
                        )
                    );
                return null;
            }

            // 否则点赞（会覆盖 dislike）
            await db
                .insert(commentReactions)
                .values({ userId, commentId, type: "like" })
                .onConflictDoUpdate({
                    target: [commentReactions.userId, commentReactions.commentId],
                    set: { type: "like", updateAt: new Date() },
                });

            return { type: "like" };
        }),

    dislike: protectedProcedure
        .input(z.object({ commentId: z.string() }))
        .mutation(async ({ input, ctx }) => {
            const { commentId } = input;
            const { id: userId } = ctx.user;

            const [existingReaction] = await db
                .select()
                .from(commentReactions)
                .where(
                    and(
                        eq(commentReactions.userId, userId),
                        eq(commentReactions.commentId, commentId)
                    )
                );

            if (existingReaction?.type === "dislike") {
                // 如果已经点踩，则取消
                await db
                    .delete(commentReactions)
                    .where(
                        and(
                            eq(commentReactions.userId, userId),
                            eq(commentReactions.commentId, commentId)
                        )
                    );
                return null;
            }

            // 否则点踩（会覆盖 like）
            await db
                .insert(commentReactions)
                .values({ userId, commentId, type: "dislike" })
                .onConflictDoUpdate({
                    target: [commentReactions.userId, commentReactions.commentId],
                    set: { type: "dislike", updateAt: new Date() },
                });

            return { type: "dislike" };
        }),
});
