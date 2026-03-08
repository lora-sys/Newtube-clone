import { auth } from "@clerk/nextjs/server";
import { db } from "@/db/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cache } from "react";

interface SessionClaims {
  sub: string;
  __public?: {
    dbUserId?: string;
  };
}

export const getCurrentUser = cache(async () => {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    return null;
  }

  // 优先从 JWT 读取
  const claims = sessionClaims as SessionClaims | null;
  const dbUserId = claims?.__public?.dbUserId;

  if (dbUserId) {
    return { id: dbUserId, clerkId: userId };
  }

  // Fallback: 查询数据库
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, userId));

  return user ? { id: user.id, clerkId: user.clerkId } : null;
});
