CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" jsonb NOT NULL,
	"tagline" jsonb NOT NULL,
	"unit" jsonb NOT NULL,
	"base" double precision NOT NULL,
	"min_qty" integer DEFAULT 1 NOT NULL,
	"step" integer DEFAULT 1 NOT NULL,
	"image" text DEFAULT '' NOT NULL,
	"sizes" jsonb NOT NULL,
	"papers" jsonb NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_slug_unique" UNIQUE("slug")
);
