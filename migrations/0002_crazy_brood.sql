CREATE TYPE "public"."video_visibility" AS ENUM('private', 'public');--> statement-breakpoint
CREATE TABLE "videos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"descrption" text,
	"mux_status" text,
	"mux_asset_id" text,
	"mux_upload_id" text,
	"mux_track_id" text,
	"mux_track_status" text,
	"mux_playback_id" text,
	"user_id" uuid NOT NULL,
	"category_id" uuid,
	"thumbnail_url" text,
	"preview_url" text,
	"duration" integer,
	"visibility" "video_visibility" DEFAULT 'private' NOT NULL,
	"create_at" timestamp DEFAULT now() NOT NULL,
	"update_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "videos_mux_asset_id_unique" UNIQUE("mux_asset_id"),
	CONSTRAINT "videos_mux_upload_id_unique" UNIQUE("mux_upload_id"),
	CONSTRAINT "videos_mux_track_id_unique" UNIQUE("mux_track_id"),
	CONSTRAINT "videos_mux_playback_id_unique" UNIQUE("mux_playback_id")
);
--> statement-breakpoint
ALTER TABLE "videos" ADD CONSTRAINT "videos_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "videos" ADD CONSTRAINT "videos_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;