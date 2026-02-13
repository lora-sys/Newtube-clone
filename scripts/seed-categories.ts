// TODO: 填充视频分类脚本

import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "@/db/db";
import { categories } from "@/db/schema";

console.log("DATABASE_URL:", process.env.DATABASE_URL ? "✅ 已设置" : "❌ 未设置");

const categoryNames = [
  "Cars and vehicles",
  "Comedy",
  "Education",
  "Gaming",
  "Enterainment",
  "Film and animation",
  "Music",
  "News and politics",
  "People and blogs",
  "Pets and animals",
  "Science and  technology",
  "Sports",
  "Travel and events",
];

async function main() {
  console.log("Seed categories....");

  try {
    const values = categoryNames.map((name) => ({
      name,
      description: `Video related to ${name.toLowerCase()}`,
    }));
    await db.insert(categories).values(values);
    console.log("categories seeded sucessfully");
  } catch (error) {
    console.error("Error seeding categories:", error);
    process.exit(1);
  }
}

main();