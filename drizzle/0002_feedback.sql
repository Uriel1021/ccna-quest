CREATE TYPE "public"."feedback_category" AS ENUM('bug', 'content', 'idea', 'other');--> statement-breakpoint
CREATE TYPE "public"."feedback_status" AS ENUM('new', 'reviewing', 'resolved');--> statement-breakpoint
CREATE TABLE "feedback" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"category" "feedback_category" NOT NULL,
	"message" text NOT NULL,
	"page" text,
	"app_version" text,
	"platform" text,
	"status" "feedback_status" DEFAULT 'new' NOT NULL,
	"reply" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "feedback_status_idx" ON "feedback" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "feedback_user_idx" ON "feedback" USING btree ("user_id");