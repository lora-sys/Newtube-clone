import { db } from "@/db/db";
import { users } from "@/db/schema";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { clerkClient } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);

    const eventType = evt.type;

    if (eventType === "user.created") {
      const { data } = evt;
      const [newUser] = await db
        .insert(users)
        .values({
          clerkId: data.id,
          name: `${data.first_name} ${data.last_name}`,
          imageUrl: data.image_url,
        })
        .returning();

      // 把数据库 userId 存入 Clerk public_metadata
      // 这样后续请求可以直接从 JWT 读取，不需要查数据库
      if (newUser) {
        const client = await clerkClient();
        await client.users.updateUserMetadata(data.id, {
          publicMetadata: {
            dbUserId: newUser.id,
          },
        });
      }
    }

    if (eventType === "user.deleted") {
      const { data } = evt;
      if (!data.id) {
        throw new Response("Missing user id", { status: 400 });
      }
      await db.delete(users).where(eq(users.clerkId, data.id));
    }

    if (eventType === "user.updated") {
      const { data } = evt;
      if (!data.id) {
        throw new Response("Missing user id", { status: 400 });
      }
      const [updatedUser] = await db
        .update(users)
        .set({
          name: `${data.first_name} ${data.last_name}`,
          imageUrl: data.image_url,
        })
        .where(eq(users.clerkId, data.id))
        .returning();

      // 同步更新 public_metadata 中的 dbUserId
      if (updatedUser) {
        const client = await clerkClient();
        await client.users.updateUserMetadata(data.id, {
          publicMetadata: {
            dbUserId: updatedUser.id,
          },
        });
      }
    }

    return new Response("Webhook received", { status: 200 });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error verifying webhook", { status: 400 });
  }
}
