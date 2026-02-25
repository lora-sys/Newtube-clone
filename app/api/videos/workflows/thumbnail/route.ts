import { db } from "@/db/db";
import { videos } from "@/db/schema";
import { serve } from "@upstash/workflow/nextjs";
import { eq, and } from "drizzle-orm";
import { UTApi } from "uploadthing/server";

interface InputType {
  userId: string;
  videoId: string;
  prompt: string;
}

export const { POST } = serve(
  async (context) => {
    console.log("=== Workflow Started ===");
    console.log("Full context:", {
      workflowRunId: context.workflowRunId,
      url: context.url,
    });

    const input = context.requestPayload as InputType;
    const { videoId, userId, prompt } = input;
        const utapi = new UTApi();
    console.log("Received parameters:", { videoId, userId });

    console.log("🔍 Step 1: Fetching video...");
    const video = await context.run("get-video", async () => {
      if (!videoId || !userId) {
        throw new Error("Missing videoId or userId");
      }

      console.log("  → Executing database query...");
      const [data] = await db
        .select()
        .from(videos)
        .where(and(eq(videos.id, videoId), eq(videos.userId, userId)));

      if (!data) {
        console.error("  ❌ Video not found");
        throw new Error("Video not found");
      }

      console.log("  ✅ Found video:", data);
      return data;
    });

    console.log("🎨 Step 1/5: generate thumbnail...");
    const { status, body } = await context.call<{ data: { url: string }[] }>(
      "generate-thumbnail",
      {
        url: "https://open.bigmodel.cn/api/paas/v4/images/generations",
        method: "POST",
        body: JSON.stringify({
          model: "cogview-3-flash",
          prompt: prompt,
          n: 1,
          size: "1920x1072",
        }),
        headers: {
          Authorization: `Bearer ${process.env.ZHIPU_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (status !== 200) {
      throw new Error(`Image generation failed: ${status}`);
    }

    const tempThumbnailUrl = body.data[0].url;
    if (!tempThumbnailUrl) {
      throw new Error("Bad request");
    }
    console.log("Generated thumbnail URL:", tempThumbnailUrl);
  
    await context.run("cleanup-thumbnail" , async () => {
      if(video.thumbnailKey) {
       await utapi.deleteFiles(video.thumbnailKey);
       await db
       .update(videos)
       .set({thumbnailKey : null , thumbnailurl : null})
       .where(and(eq(videos.id, video.id), eq(videos.userId, video.userId)))
      }
    })




   const uploadThumbnailUrl =  await context.run("upload-thumbnail", async () => {

      const { data } = await utapi.uploadFilesFromUrl(tempThumbnailUrl);
      if (!data) {
        throw new Error("Bad request");
      }
      return data
    });
   


    console.log("📝 Step 2: Updating video thumbnail...");
    await context.run("update-video", async () => {
      await db
        .update(videos)
        .set({
          thumbnailKey : uploadThumbnailUrl.key,
          thumbnailurl : uploadThumbnailUrl.ufsUrl,
        })
        .where(and(eq(videos.id, video.id), eq(videos.userId, video.userId)));
    });
  },
  {
    baseUrl: process.env.QSTASH_WORKFLOW_URL,
  },
);
