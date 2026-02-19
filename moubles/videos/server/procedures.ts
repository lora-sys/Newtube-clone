import { db } from "@/db/db";
import { videos } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";


export const videosRouter = createTRPCRouter({
  create : protectedProcedure.mutation(async ({ctx}) => {
 const {id :userId} =ctx.user;

const [video] = await db.insert(videos)
.values({
  userId,
  title : "undefined",
})
.returning();


return {
  video : video,
}
  })
});
