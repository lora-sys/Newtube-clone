import { db } from "@/db/db";
import { videos } from "@/db/schema";
import { serve } from "@upstash/workflow/nextjs";
import { eq, and } from "drizzle-orm";

interface InputType {
  userId: string;
  videoId: string;
}

const TITLE_SYSTEM_PROMPT = `Your task is to generate an SEO-focused title for a YouTube video based on its transcript. Please follow these guidelines:
- Be concise but descriptive, using relevant keywords to improve discoverability.
- Highlight the most compelling or unique aspect of the video content.
- Avoid jargon or overly complex language unless it directly supports searchability.
- Use action-oriented phrasing or clear value propositions where applicable.
- Ensure the title is 3-8 words long and no more than 100 characters.
- ONLY return the title as plain text. Do not add quotes or any additional formatting.`;

export const { POST } = serve(
  async (context) => {
    console.log("=== Workflow Started ===");
    console.log("Full context:", {
      workflowRunId: context.workflowRunId,
      url: context.url,
    });

    const input = context.requestPayload as InputType;
    const { videoId, userId } = input;

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

    const transcript = await context.run("get-transcript", async () => {
      if (!video.muxPlaybackId) {
        throw new Error("No muxPlaybackId available");
      }

      const trackUrl= ` https://stream.mux.com/${video.muxPlaybackId}/text/${video.muxTrackId}.txt`
      console.log("  → Fetching transcript from:", trackUrl);
      
      const response = await fetch(trackUrl);
      console.log("  → Transcript fetch status:", response.status);

      if (!response.ok) {
        throw new Error(`Failed to fetch transcript: ${response.status}`);
      }

      const text = await response.text();
      console.log("  → Transcript length:", text.length);

      if (!text || text.length < 10) {
        throw new Error("Transcript is empty or too short");
      }

      return text;
    });

    console.log("📝 Step 1/5: generate video title...");
    const { status, body } = await context.api.openai.call("generate-title", {
      baseURL: "https://apis.iflow.cn",
      token: process.env.OPENAI_API_KEY!,
      operation: "chat.completions.create",
      body: {
        model: "qwen3-coder-plus",
        messages: [
          {
            role: "system",
            content: TITLE_SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: transcript,
          },
        ],
      },
    });

    console.log("API Response status:", status);
    console.log("API Response body:", JSON.stringify(body));

    if (status !== 200) {
      throw new Error(
        `API call failed with status ${status}: ${JSON.stringify(body)}`,
      );
    }
    const title = body.choices?.[0]?.message?.content;
    if (!title) {
      throw new Error("Bad Request!");
    }
    console.log("📝 Step 2: Updating video title...");
    await context.run("update-video", async () => {
      await db
        .update(videos)
        .set({
          title: title || video.title,
        })
        .where(and(eq(videos.id, video.id), eq(videos.userId, video.userId)));
    });
  },
  {
    baseUrl: process.env.QSTASH_WORKFLOW_URL,
  },
);
