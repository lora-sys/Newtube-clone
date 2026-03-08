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
  }),
  playlists: many(playlists),
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
  videoReactions : many(videoReactions),
  comments : many(comments),
  playlistVideos: many(playlistVideos),
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





export const comments = pgTable("comments", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId : uuid("user_id").references(()=>users.id,{onDelete : "cascade"}).notNull(),
    videoId : uuid("video_id").references(()=>videos.id,{onDelete : "cascade"}).notNull(),
    parentId: uuid("parent_id"),
    value : text("value").notNull(),
    createAt: timestamp("create_at").defaultNow().notNull(),
    updateAt: timestamp("update_at").defaultNow().notNull(),
})

export const commentsRelations = relations(comments, ({ one, many }) => ({
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  video: one(videos, {
    fields: [comments.videoId],
    references: [videos.id],
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
    relationName: "comment_replies",
  }),
  replies: many(comments, {
    relationName: "comment_replies",
  }),
  commentReactions: many(commentReactions),
}));

export const commentsInsertSchema = createInsertSchema(comments);
export const commentsSelectSchema = createSelectSchema(comments);
export const commentsUpdateSchema = createUpdateSchema(comments);

// Comment Reactions
export const commentReactions = pgTable("comment_reactions", {
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  commentId: uuid("comment_id").references(() => comments.id, { onDelete: "cascade" }).notNull(),
  type: reactionType("type").notNull(),
  createAt: timestamp("create_at").defaultNow().notNull(),
  updateAt: timestamp("update_at").defaultNow().notNull(),
}, (t) => [
  primaryKey({
    name: "comment_reactions_pk",
    columns: [t.userId, t.commentId]
  }),
])

export const commentReactionsRelations = relations(commentReactions, ({ one }) => ({
  user: one(users, {
    fields: [commentReactions.userId],
    references: [users.id],
  }),
  comment: one(comments, {
    fields: [commentReactions.commentId],
    references: [comments.id],
  }),
}));

export const commentReactionsInsertSchema = createInsertSchema(commentReactions);
export const commentReactionsSelectSchema = createSelectSchema(commentReactions);
export const commentReactionsUpdateSchema = createUpdateSchema(commentReactions);

// Playlists
export const playlistVisibility = pgEnum("playlist_visibility", ["private", "public"]);

export const playlists = pgTable("playlists", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  visibility: playlistVisibility("visibility").default("private").notNull(),
  createAt: timestamp("create_at").defaultNow().notNull(),
  updateAt: timestamp("update_at").defaultNow().notNull(),
});

export const playlistsRelations = relations(playlists, ({ one, many }) => ({
  user: one(users, {
    fields: [playlists.userId],
    references: [users.id],
  }),
  playlistVideos: many(playlistVideos),
}));

export const playlistsInsertSchema = createInsertSchema(playlists);
export const playlistsSelectSchema = createSelectSchema(playlists);
export const playlistsUpdateSchema = createUpdateSchema(playlists);

// Playlist Videos (many-to-many)
export const playlistVideos = pgTable("playlist_videos", {
  playlistId: uuid("playlist_id")
    .references(() => playlists.id, { onDelete: "cascade" })
    .notNull(),
  videoId: uuid("video_id")
    .references(() => videos.id, { onDelete: "cascade" })
    .notNull(),
  createAt: timestamp("create_at").defaultNow().notNull(),
}, (t) => [
  primaryKey({
    name: "playlist_videos_pk",
    columns: [t.playlistId, t.videoId],
  }),
]);

export const playlistVideosRelations = relations(playlistVideos, ({ one }) => ({
  playlist: one(playlists, {
    fields: [playlistVideos.playlistId],
    references: [playlists.id],
  }),
  video: one(videos, {
    fields: [playlistVideos.videoId],
    references: [videos.id],
  }),
}));

export const playlistVideosInsertSchema = createInsertSchema(playlistVideos);
export const playlistVideosSelectSchema = createSelectSchema(playlistVideos);

// Watch Later
export const watchLater = pgTable("watch_later", {
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  videoId: uuid("video_id")
    .references(() => videos.id, { onDelete: "cascade" })
    .notNull(),
  createAt: timestamp("create_at").defaultNow().notNull(),
}, (t) => [
  primaryKey({
    name: "watch_later_pk",
    columns: [t.userId, t.videoId],
  }),
]);

export const watchLaterRelations = relations(watchLater, ({ one }) => ({
  user: one(users, {
    fields: [watchLater.userId],
    references: [users.id],
  }),
  video: one(videos, {
    fields: [watchLater.videoId],
    references: [videos.id],
  }),
}));

export const watchLaterInsertSchema = createInsertSchema(watchLater);
export const watchLaterSelectSchema = createSelectSchema(watchLater);