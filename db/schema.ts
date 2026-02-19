import {
  pgTable,
  uuid,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
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

export const userRelations = relations(users, ({many})=> ({
  videos : many(videos),
}))



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


export const categoryRelations = relations(users, ({many})=> ({
  videos : many(videos),
}))


export const videos = pgTable("videos", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("descrption"),
  userId: uuid("user_id")
    .references(() => users.id, {
      onDelete: "cascade",
    })
    .notNull(),
  categoryId : uuid("category_id").references(()=> categories.id,{
    onDelete: "set null",
  }),
  createAt: timestamp("create_at").defaultNow().notNull(),
  updateAt: timestamp("update_at").defaultNow().notNull(),
});



export const videlRelations = relations(videos, ({ one, many }) => ({
  users: one(users, {
    fields: [videos.userId],
    references : [users.id],
  }),
  category: one(categories, {
    fields: [videos.categoryId],
    references : [categories.id],
  }),
}));
