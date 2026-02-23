import { db } from "@/db/db";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { initTRPC, TRPCError } from "@trpc/server";
import { cache } from "react";
import superjson from "superjson";
import { ratelimit } from "@/lib/ratelimit";
export const createTRPCContext = cache(async () => {
  const { userId } = await auth();
  return { clerkUserId: userId };
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
    console.log("🔐 protectedProcedure - ctx.clerkUserId:", ctx.clerkUserId);

    if (!ctx.clerkUserId) {
      console.error("❌ 未找到 clerkUserId");
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const clerkUserId: string = ctx.clerkUserId;
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkUserId))
      .limit(1);

    console.log("👤 数据库查询结果 user:", user);

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

    // 速率限制检查，如果 Redis 不可用则跳过
    try {
      const { success } = await ratelimit.limit(user.id);
      if (!success) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS" });
      }
    } catch (error) {
      // Redis 连接失败时，记录日志但不阻止请求
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
