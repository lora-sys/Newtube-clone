import { db } from "@/db/db";
import { commentReactions, comments, users } from "@/db/schema";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { eq, desc, getTableColumns, inArray, lt, and,  isNull, count } from "drizzle-orm";
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
                        isNull(comments.parentId), // Only top-level comments
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

            // Get reply counts for each comment
            // use map query each comment reply through parent id 
            // first choose id array , then map chooose each comment with reply 
            const commentIds = items.map(item => item.id);
            const replyCounts = commentIds.length > 0 
                ? await db
                    .select({
                        parentId: comments.parentId,
                        count: count(),
                    })
                    .from(comments)
                    .where(inArray(comments.parentId, commentIds))
                    .groupBy(comments.parentId)
                : [];

            const replyCountMap = new Map(replyCounts.map(r => [r.parentId, r.count]));

            return {
                items: items.map(item => ({
                    ...item,
                    replyCount: replyCountMap.get(item.id) ?? 0,
                })),
                nextCursor,
                viewerId,
            };
        }),

    getReplies: baseProcedure
        .input(z.object({ 
            parentId: z.string(),
            limit: z.number().min(1).max(100).default(5),
            cursor: z.object({
                id: z.string(),
                createAt: z.date(),
            }).optional(),
        }))
        .query(async ({ input, ctx }) => {
            const { clerkUserId } = ctx;
            const { parentId, limit, cursor } = input;

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
                        eq(comments.parentId, parentId),
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
            parentId: z.string().optional(),
        }))
        .mutation(async ({ input, ctx }) => {
            const { id: userId } = ctx.user;

            const [comment] = await db
                .insert(comments)
                .values({
                    userId,
                    videoId: input.videoId,
                    value: input.value,
                    parentId: input.parentId,
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

            // 先检查评论是否存在且属于当前用户
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

            // 删除所有子回复（级联删除）
            await db
                .delete(comments)
                .where(eq(comments.parentId, input.id));

            // 删除评论本身
            const [deletedComment] = await db
                .delete(comments)
                .where(eq(comments.id, input.id))
                .returning();

            return deletedComment;
        }),
});
