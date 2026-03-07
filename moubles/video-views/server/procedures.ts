import { db } from "@/db/db";
import { videosViews } from "@/db/schema";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "@/trpc/init";
import z from "zod";
import { eq, and } from "drizzle-orm";



export const videoViewsRouter = createTRPCRouter({
    create: protectedProcedure
        .input(z.object({ videoId: z.string() }))
        .mutation(async ({ input, ctx }) => {
            const { videoId } = input;
            const { id: userId } = ctx.user;

            const [existingvideoViews] = await db
                .select()
                .from(videosViews)
                .where(
                    and(
                        eq(videosViews.videoId, videoId),
                        eq(videosViews.userId, userId),
                    )
                )
            if (existingvideoViews) {
                return existingvideoViews;
            }
            const [createVideoViews] = await db
                .insert(videosViews)
                .values({ userId, videoId })
                .returning();

            return createVideoViews;

        })
})