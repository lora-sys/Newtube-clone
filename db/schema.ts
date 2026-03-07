import {
  pgTable,
  uuid,
  text,
  timestamp,
  uniqueIndex,
  integer,
  pgEnum,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clerkId: text("clerk_id").unique().notNull(),
    name: text("name").notNull(),
    //TODO : add banner fields
    imageUrl: text("image_url").notNull(),
    createAt: timestamp("create_at").defaultNow().notNull(),
    updateAt: timestamp("update_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("clerk_id_idx").on(t.clerkId)],
);

export const userRelations = relations(users, ({ many }) => ({
  videos: many(videos),
  videosViews : many(videosViews),
  videoReactions : many(videoReactions),
  subscriptions: many(subscriptions,{
    relationName : "subscriptions_viewer_id_fkey"
  }
  ),
  subscribers : many(subscriptions,{
    relationName : "subscriptions_creator_id_fkey"
  })
}));

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull().unique(),
    description: text("description"),
    createAt: timestamp("create_at").defaultNow().notNull(),
    updateAt: timestamp("update_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("name_idx").on(t.name)],
);

export const categoryRelations = relations(categories, ({ many }) => ({
  videos: many(videos),
}));

export const videoVisiblity = pgEnum("video_visibility", ["private", "public"]);

export const videos = pgTable("videos", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("descrption"),
  muxStatus: text("mux_status"),
  muxAssetId: text("mux_asset_id").unique(),
  muxUploadId: text("mux_upload_id").unique(),
  muxTrackId: text("mux_track_id").unique(),
  muxTrackStatus: text("mux_track_status"),
  muxPlaybackId: text("mux_playback_id").unique(),
  userId: uuid("user_id")
    .references(() => users.id, {
      onDelete: "cascade",
    })
    .notNull(),
  categoryId: uuid("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  thumbnailurl: text("thumbnail_url"),
  previewUrl: text("preview_url"),
  thumbnailKey : text("thumbnailkey"),
  previewKey : text("previewkey"),
  duration: integer("duration"),
  videoVisiblity: videoVisiblity("visibility").default("private").notNull(),
  createAt: timestamp("create_at").defaultNow().notNull(),
  updateAt: timestamp("update_at").defaultNow().notNull(),
});


export const videoInsertSchema = createInsertSchema(videos);
export const videoSelectSchema = createSelectSchema(videos);
export const videoUpdateSchema = createUpdateSchema(videos);

export const videoRelations = relations(videos, ({ one, many }) => ({
  users: one(users, {
    fields: [videos.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [videos.categoryId],
    references: [categories.id],
  }),
  views : many(videosViews),
  videoReactions : many(videoReactions)
}));


export const videosViews = pgTable("video_views",{
  userId : uuid("user_id").references(()=>users.id,{onDelete : "cascade"}).notNull(),
  videoId : uuid("video_id").references(()=>videos.id,{onDelete : "cascade"}).notNull(),
  createAt: timestamp("create_at").defaultNow().notNull(),
  updateAt: timestamp("update_at").defaultNow().notNull(),
},(t)=> [
  primaryKey({
    name : "video_views_pk",
    columns : [t.userId,t.videoId]
  }),
])


export const videoViewsRelations = relations(videosViews, ({ one }) => ({
  users: one(users, {
    fields: [videosViews.userId],
    references: [users.id],
  }),
  videos: one(videos, {
    fields: [videosViews.videoId],
    references: [videos.id],
  }),
}));

export const videoViewInsertSchema = createInsertSchema(videosViews);
export const videoViewSelectSchema = createSelectSchema(videosViews);
export const videoViewUpdateSchema = createUpdateSchema(videosViews);

export const reactionType = pgEnum ("reaction_type",["like","dislike"])

export const videoReactions = pgTable("video_reactions",{
  userId : uuid("user_id").references(()=>users.id,{onDelete : "cascade"}).notNull(),
  videoId : uuid("video_id").references(()=>videos.id,{onDelete : "cascade"}).notNull(),
  type : reactionType("type").notNull(),
  createAt: timestamp("create_at").defaultNow().notNull(),
  updateAt: timestamp("update_at").defaultNow().notNull(),
},(t)=> [
  primaryKey({
    name : "video_reactions_pk",
    columns : [t.userId,t.videoId]
  }),
])

export const videoReactionRelations = relations(videoReactions, ({ one }) => ({
  users: one(users, {
    fields: [videoReactions.userId],
    references: [users.id],
  }),
  videos: one(videos, {
    fields: [videoReactions.videoId],
    references: [videos.id],
  }),
}));



export const videoReactionsInsertSchema = createInsertSchema(videoReactions);
export const videoReactionsSelectSchema = createSelectSchema(videoReactions);
export const videoReactionsUpdateSchema = createUpdateSchema(videoReactions);

// Subscriptions
export const subscriptions = pgTable("subscriptions", {
  viewerId: uuid("viewer_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  creatorId: uuid("creator_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  createAt: timestamp("create_at").defaultNow().notNull(),
  updateAt: timestamp("update_at").defaultNow().notNull(),
}, (t) => [
  primaryKey({
    name: "subscriptions_pk",
    columns: [t.viewerId, t.creatorId]
  }),
])

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  viewer: one(users, {
    fields: [subscriptions.viewerId],
    references: [users.id],
    relationName : "subscriptions_viewer_id_fkey"
  }),
  creator: one(users, {
    fields: [subscriptions.creatorId],
    references: [users.id],
    relationName : "subscriptions_creator_id_fkey"
  }),
}));

export const subscriptionsInsertSchema = createInsertSchema(subscriptions);
export const subscriptionsSelectSchema = createSelectSchema(subscriptions);
export const subscriptionsUpdateSchema = createUpdateSchema(subscriptions);