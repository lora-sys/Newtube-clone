import { db } from "@/db/db";
import { videos } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import {  z } from "zod";
import {eq , and , or ,lt , desc} from "drizzle-orm"
export const studioRouter = createTRPCRouter({
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
      // check if more data
       const hasMore = data.length  > limit
      // if have, pop out last data
       const items = hasMore ? data.slice(0,-1) : data;

      const lastItem = items[items.length - 1];
       const nextCursor = hasMore ?
       {
        id : lastItem.id,
        updateAt : lastItem.updateAt,
       }
        :
        null;

      return {
        items,
        nextCursor,
      };
    }),
});
