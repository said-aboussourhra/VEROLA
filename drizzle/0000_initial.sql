CREATE TABLE "dev_profile" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text DEFAULT 'SA ID' NOT NULL,
	"role" text DEFAULT 'Web Developer & Digital Creator' NOT NULL,
	"about" text,
	"photo" text,
	"whatsapp" text,
	"instagram" text,
	"email" text,
	"skills" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "downloads" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"member_phone" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"order_code" text NOT NULL,
	"product" text NOT NULL,
	"sheets" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "jobs_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"url" text NOT NULL,
	"category" text DEFAULT 'hero' NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "members" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "members_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"type" text DEFAULT 'info' NOT NULL,
	"title" text NOT NULL,
	"body" text,
	"href" text,
	"read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_code" text NOT NULL,
	"from_role" text DEFAULT 'customer' NOT NULL,
	"sender_name" text,
	"body" text NOT NULL,
	"attachment" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text,
	"address" text,
	"city" text,
	"zone" text DEFAULT 'a' NOT NULL,
	"payment" text DEFAULT 'cod' NOT NULL,
	"product" text NOT NULL,
	"size" text NOT NULL,
	"paper" text NOT NULL,
	"finish" text NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" double precision DEFAULT 0 NOT NULL,
	"subtotal" double precision DEFAULT 0 NOT NULL,
	"vat" double precision DEFAULT 0 NOT NULL,
	"delivery" double precision DEFAULT 0 NOT NULL,
	"total" double precision DEFAULT 0 NOT NULL,
	"express" boolean DEFAULT false NOT NULL,
	"artwork_name" text,
	"artwork_url" text,
	"advance_amount" double precision DEFAULT 0 NOT NULL,
	"rib_sender" text,
	"receipt" text,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "orders_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "product_mockups" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"name" text NOT NULL,
	"category" text DEFAULT 'textile' NOT NULL,
	"view" text DEFAULT 'front' NOT NULL,
	"image" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"area_x" double precision DEFAULT 20 NOT NULL,
	"area_y" double precision DEFAULT 15 NOT NULL,
	"area_w" double precision DEFAULT 60 NOT NULL,
	"area_h" double precision DEFAULT 55 NOT NULL,
	"max_width_cm" double precision DEFAULT 30 NOT NULL,
	"max_height_cm" double precision DEFAULT 40 NOT NULL,
	"min_width_dpi" integer DEFAULT 300 NOT NULL,
	"formats" text DEFAULT 'png,jpg,jpeg,svg,pdf' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saved_designs" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"user_id" integer NOT NULL,
	"product_id" text NOT NULL,
	"canvas_json" text,
	"preview_url" text,
	"version" integer DEFAULT 1 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "saved_designs_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"user_id" integer NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"pass_hash" text NOT NULL,
	"role" text DEFAULT 'client' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
