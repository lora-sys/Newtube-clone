import { db } from "@/db/db";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { initTRPC, TRPCError } from "@trpc/server";
import { cache } from "react";
import superjson from "superjson";
import { ratelimit } from "@/lib/ratelimit";
import { redis } from "@/lib/redis";

// JWT session claims 类型定义
interface SessionClaims {
  sub: string;
  __public?: {
    dbUserId?: string;
  };
}

// Redis 缓存 key 前缀
const USER_CACHE_PREFIX = "user:dbId:";
const CACHE_TTL = 60 * 60; // 1 小时（秒）

export const createTRPCContext = cache(async () => {
  const { userId, sessionClaims } = await auth();
  
  // 从 JWT 直接读取数据库 userId（如果存在）
  const claims = sessionClaims as SessionClaims | null;
  const dbUserId = claims?.__public?.dbUserId;
  
  return { 
    clerkUserId: userId,
    dbUserId, // 直接从 JWT 获取，不需要查数据库
  };
});

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  transformer: superjson,
});
// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(
  async function isAuthed(opts) {
    const { ctx } = opts;

    if (!ctx.clerkUserId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    // 🚀 优化：优先从 JWT 读取 userId，不需要查数据库
    if (ctx.dbUserId) {
      // 速率限制检查
      try {
        const { success } = await ratelimit.limit(ctx.dbUserId);
        if (!success) {
          throw new TRPCError({ code: "TOO_MANY_REQUESTS" });
        }
      } catch (error) {
        console.error("Rate limit check failed:", error);
      }

      // 直接返回，不查询数据库
      return opts.next({
        ctx: {
          ...ctx,
          user: { id: ctx.dbUserId }, // 最小用户信息
        },
      });
    }

    // 尝试从 Redis 缓存读取
    const cacheKey = USER_CACHE_PREFIX + ctx.clerkUserId;
    try {
      const cachedDbId = await redis.get<string>(cacheKey);
      if (cachedDbId) {
        // 速率限制检查
        try {
          const { success } = await ratelimit.limit(cachedDbId);
          if (!success) {
            throw new TRPCError({ code: "TOO_MANY_REQUESTS" });
          }
        } catch (error) {
          console.error("Rate limit check failed:", error);
        }

        return opts.next({
          ctx: {
            ...ctx,
            user: { id: cachedDbId },
          },
        });
      }
    } catch (err) {
      console.error("Redis cache read failed:", err);
    }

    // ⚠️ Fallback: JWT 中没有 dbUserId，查询数据库（兼容旧用户）
    console.warn("⚠️ JWT 中没有 dbUserId，回退到数据库查询");
    
    const clerkUserId: string = ctx.clerkUserId;
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkUserId))
      .limit(1);

    if (!user) {
      // 开发环境下自动创建用户记录
      console.warn("⚠️ 用户记录不存在，尝试创建...");
      try {
        const client = await clerkClient();
        const clerkUser = await client.users.getUser(clerkUserId);
        
        const [newUser] = await db
          .insert(users)
          .values({
            clerkId: clerkUser.id,
            name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || clerkUser.id,
            imageUrl: clerkUser.imageUrl,
          })
          .returning();
        
        if (!newUser) {
          throw new Error("Failed to create user");
        }

        // 写入 Redis 缓存
        try {
          await redis.set(cacheKey, newUser.id, { ex: CACHE_TTL });
        } catch (err) {
          console.error("Redis cache write failed:", err);
        }

        // 把新用户的 dbUserId 存入 Clerk，下次就不用查数据库了
        await client.users.updateUserMetadata(clerkUserId, {
          publicMetadata: {
            dbUserId: newUser.id,
          },
        });
        
        return opts.next({
          ctx: {
            ...ctx,
            user: newUser,
          },
        });
      } catch (err) {
        console.error("❌ 自动创建用户失败:", err);
        throw new TRPCError({ code: "UNAUTHORIZED", message: "User not found in database" });
      }
    }

    // 写入 Redis 缓存
    try {
      await redis.set(cacheKey, user.id, { ex: CACHE_TTL });
    } catch (err) {
      console.error("Redis cache write failed:", err);
    }

    // 为旧用户补充 dbUserId 到 JWT
    try {
      const client = await clerkClient();
      await client.users.updateUserMetadata(clerkUserId, {
        publicMetadata: {
          dbUserId: user.id,
        },
      });
    } catch (err) {
      console.error("更新 public_metadata 失败:", err);
    }

    // 速率限制检查
    try {
      const { success } = await ratelimit.limit(user.id);
      if (!success) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS" });
      }
    } catch (error) {
      console.error("Rate limit check failed:", error);
    }

    return opts.next({
      ctx: {
        ...ctx,
        user,
      },
    });
  },
);
