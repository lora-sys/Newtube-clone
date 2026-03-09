import { db } from "@/db/db";
import { subscriptions, users } from "@/db/schema";
import { createTRPCRouter, protectedProcedure, baseProcedure } from "@/trpc/init";
import { and, eq, sql, desc } from "drizzle-orm";
import { z } from "zod";

export const subscriptionsRouter = createTRPCRouter({
    getMany: protectedProcedure
      .input(
        z.object({
          limit: z.number().min(1).max(100).optional(),
        }).optional()
      )
      .query(async ({ ctx, input }) => {
        const { id: userId } = ctx.user;
        const limit = input?.limit;

        const data = await db
          .select({
            creatorId: subscriptions.creatorId,
            createdAt: subscriptions.createAt,
            creator: {
              id: users.id,
              name: users.name,
              imageUrl: users.imageUrl,
              subscriberCount: db.$count(
                subscriptions,
                eq(subscriptions.creatorId, users.id)
              ),
            },
          })
          .from(subscriptions)
          .innerJoin(users, eq(subscriptions.creatorId, users.id))
          .where(eq(subscriptions.viewerId, userId))
          .orderBy(desc(subscriptions.createAt))
          .limit(limit ?? 100);

        return data;
    }),

    check: protectedProcedure
        .input(z.object({ creatorId: z.string() }))
        .query(async ({ ctx, input }) => {
            const { creatorId } = input;
            const { id: viewerId } = ctx.user;

            const [subscription] = await db
                .select()
                .from(subscriptions)
                .where(
                    and(
                        eq(subscriptions.viewerId, viewerId),
                        eq(subscriptions.creatorId, creatorId)
                    )
                );

            return {
                isSubscribed: !!subscription,
            };
        }),

    create: protectedProcedure
        .input(z.object({ creatorId: z.string() }))
        .mutation(async ({ input, ctx }) => {
            const { creatorId } = input;
            const { id: viewerId } = ctx.user;

            if (viewerId === creatorId) {
                throw new Error("Cannot subscribe to yourself");
            }

            const [existingSubscription] = await db
                .select()
                .from(subscriptions)
                .where(
                    and(
                        eq(subscriptions.viewerId, viewerId),
                        eq(subscriptions.creatorId, creatorId)
                    )
                );

            if (existingSubscription) {
                return existingSubscription;
            }

            const [newSubscription] = await db
                .insert(subscriptions)
                .values({ viewerId, creatorId })
                .returning();

            return newSubscription;
        }),

    remove: protectedProcedure
        .input(z.object({ creatorId: z.string() }))
        .mutation(async ({ input, ctx }) => {
            const { creatorId } = input;
            const { id: viewerId } = ctx.user;

            const [deletedSubscription] = await db
                .delete(subscriptions)
                .where(
                    and(
                        eq(subscriptions.viewerId, viewerId),
                        eq(subscriptions.creatorId, creatorId)
                    )
                )
                .returning();

            return deletedSubscription;
        }),
});
