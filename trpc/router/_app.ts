import { categoriesRouter } from "@/moubles/categories/server/procedures";

import { createTRPCRouter } from "../init";
import { studioRouter } from "@/moubles/studio/server/procedures";
import { videosRouter } from "@/moubles/videos/server/procedures";
export const appRouter = createTRPCRouter({
  categories: categoriesRouter,
  studio : studioRouter,
  videos : videosRouter
});
// export type definition of API
export type AppRouter = typeof appRouter;
