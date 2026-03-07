import { categoriesRouter } from "@/moubles/categories/server/procedures";

import { createTRPCRouter } from "../init";
import { studioRouter } from "@/moubles/studio/server/procedures";
import { videosRouter } from "@/moubles/videos/server/procedures";
import { videoViewsRouter } from "@/moubles/video-views/server/procedures";
import { videoReactionsRouter } from "@/moubles/video-reactions/server/procedures";
import { subscriptionsRouter } from "@/moubles/subscriptions/server/procedures";


export const appRouter = createTRPCRouter({
  categories: categoriesRouter,
  studio: studioRouter,
  videos: videosRouter,
  videoViews: videoViewsRouter,
  videoReactions : videoReactionsRouter,
  subscriptions: subscriptionsRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
