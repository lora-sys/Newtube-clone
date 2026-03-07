import { db } from "@/db/db";
import { subscriptions } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

export const subscriptionsRouter = createTRPCRouter({
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
