import { db } from "@/db/db";
import { commentReactions, comments, users } from "@/db/schema";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { eq, desc, getTableColumns, inArray, lt, and, sql } from "drizzle-orm";
import { z } from "zod";

export const commentsRouter = createTRPCRouter({
    getMany: baseProcedure
        .input(z.object({ 
            videoId: z.string(),
            limit: z.number().min(1).max(100).default(10),
            cursor: z.object({
                id: z.string(),
                createAt: z.date(),
            }).optional(),
        }))
        .query(async ({ input, ctx }) => {
            const { clerkUserId } = ctx;
            const { videoId, limit, cursor } = input;

            // 获取当前用户的数据库 ID
            let viewerId: string | undefined;
            if (clerkUserId) {
                const [user] = await db
                    .select()
                    .from(users)
                    .where(inArray(users.clerkId, [clerkUserId]));
                if (user) {
                    viewerId = user.id;
                }
            }

            // CTE for viewer reactions
            const viewerReactions = db.$with("viewer_reactions").as(
                db
                    .select({
                        commentId: commentReactions.commentId,
                        type: commentReactions.type,
                    })
                    .from(commentReactions)
                    .where(inArray(commentReactions.userId, viewerId ? [viewerId] : []))
            );

            const data = await db
                .with(viewerReactions)
                .select({
                    ...getTableColumns(comments),
                    user: {
                        ...getTableColumns(users),
                    },
                    likeCount: db.$count(commentReactions, 
                        and(
                            eq(commentReactions.commentId, comments.id),
                            eq(commentReactions.type, "like")
                        )
                    ),
                    dislikeCount: db.$count(commentReactions,
                        and(
                            eq(commentReactions.commentId, comments.id),
                            eq(commentReactions.type, "dislike")
                        )
                    ),
                    viewerReaction: viewerReactions.type,
                })
                .from(comments)
                .innerJoin(users, eq(comments.userId, users.id))
                .leftJoin(viewerReactions, eq(viewerReactions.commentId, comments.id))
                .where(
                    and(
                        eq(comments.videoId, videoId),
                        cursor 
                            ? lt(comments.createAt, cursor.createAt) 
                            : undefined,
                    )
                )
                .orderBy(desc(comments.createAt))
                .limit(limit + 1);

            // 判断是否有下一页
            const hasMore = data.length > limit;
            const items = hasMore ? data.slice(0, -1) : data;
            
            // 设置下一页的 cursor
            const nextCursor = hasMore 
                ? { id: items[items.length - 1].id, createAt: items[items.length - 1].createAt }
                : null;

            return {
                items,
                nextCursor,
                viewerId,
            };
        }),

    create: protectedProcedure
        .input(z.object({
            videoId: z.string(),
            value: z.string().min(1).max(1000),
        }))
        .mutation(async ({ input, ctx }) => {
            const { id: userId } = ctx.user;

            const [comment] = await db
                .insert(comments)
                .values({
                    userId,
                    videoId: input.videoId,
                    value: input.value,
                })
                .returning();

            return comment;
        }),

    update: protectedProcedure
        .input(z.object({
            id: z.string(),
            value: z.string().min(1).max(1000),
        }))
        .mutation(async ({ input, ctx }) => {
            const { id: userId } = ctx.user;

            const [existingComment] = await db
                .select()
                .from(comments)
                .where(eq(comments.id, input.id));

            if (!existingComment) {
                throw new TRPCError({ code: "NOT_FOUND" });
            }

            if (existingComment.userId !== userId) {
                throw new TRPCError({ code: "FORBIDDEN" });
            }

            const [updatedComment] = await db
                .update(comments)
                .set({
                    value: input.value,
                    updateAt: new Date(),
                })
                .where(eq(comments.id, input.id))
                .returning();

            return updatedComment;
        }),

    remove: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input, ctx }) => {
            const { id: userId } = ctx.user;

            const [deletedComment] = await db
                .delete(comments)
                .where(eq(comments.id, input.id))
                .returning();

            if (!deletedComment) {
                throw new TRPCError({ code: "NOT_FOUND" });
            }

            if (deletedComment.userId !== userId) {
                throw new TRPCError({ code: "FORBIDDEN" });
            }

            return deletedComment;
        }),
});
