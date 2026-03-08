import { db } from "@/db/db";
import { subscriptions, users } from "@/db/schema";
import { createTRPCRouter, protectedProcedure, baseProcedure } from "@/trpc/init";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

export const subscriptionsRouter = createTRPCRouter({
    getMany: protectedProcedure.query(async ({ ctx }) => {
        const { id: userId } = ctx.user;

        const data = await db
            .select({
                creatorId: subscriptions.creatorId,
                creator: {
                    id: users.id,
                    name: users.name,
                    imageUrl: users.imageUrl,
                },
            })
            .from(subscriptions)
            .innerJoin(users, eq(subscriptions.creatorId, users.id))
            .where(eq(subscriptions.viewerId, userId));

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
