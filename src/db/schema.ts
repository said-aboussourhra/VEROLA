import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  doublePrecision,
} from "drizzle-orm/pg-core";

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  address: text("address"),
  city: text("city"),
  zone: text("zone").notNull().default("a"),
  payment: text("payment").notNull().default("cod"),
  product: text("product").notNull(),
  size: text("size").notNull(),
  paper: text("paper").notNull(),
  finish: text("finish").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: doublePrecision("unit_price").notNull().default(0),
  subtotal: doublePrecision("subtotal").notNull().default(0),
  vat: doublePrecision("vat").notNull().default(0),
  delivery: doublePrecision("delivery").notNull().default(0),
  total: doublePrecision("total").notNull().default(0),
  express: boolean("express").notNull().default(false),
  artworkName: text("artwork_name"),
  artworkUrl: text("artwork_url"),
  advanceAmount: doublePrecision("advance_amount").notNull().default(0),
  ribSender: text("rib_sender"),
  receipt: text("receipt"),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

/** A production job on the press floor, created when an order is placed. */
export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  orderCode: text("order_code").notNull(),
  product: text("product").notNull(),
  sheets: integer("sheets").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Job = typeof jobs.$inferSelect;
export type NewJob = typeof jobs.$inferInsert;

/** Design-library membership (unlocks subscription designs). */
export const members = pgTable("members", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Member = typeof members.$inferSelect;

/** Download telemetry per design. */
export const downloads = pgTable("downloads", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull(),
  memberPhone: text("member_phone"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Download = typeof downloads.$inferSelect;

/** Real accounts. */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  passHash: text("pass_hash").notNull(),
  role: text("role").notNull().default("client"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;

/** Admin-managed media (hero / portfolio / mockups). */
export const media = pgTable("media", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  url: text("url").notNull(),
  category: text("category").notNull().default("hero"),
  position: integer("position").notNull().default(0),
  featured: boolean("featured").notNull().default(false),
  enabled: boolean("enabled").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Product mockups + print areas, configurable from the admin. */
export const productMockups = pgTable("product_mockups", {
  id: serial("id").primaryKey(),
  productId: text("product_id").notNull(),
  name: text("name").notNull(),
  category: text("category").notNull().default("textile"),
  view: text("view").notNull().default("front"),
  image: text("image").notNull(),
  enabled: boolean("enabled").notNull().default(true),
  // print area, expressed in % of the mockup box
  areaX: doublePrecision("area_x").notNull().default(20),
  areaY: doublePrecision("area_y").notNull().default(15),
  areaW: doublePrecision("area_w").notNull().default(60),
  areaH: doublePrecision("area_h").notNull().default(55),
  maxWidthCm: doublePrecision("max_width_cm").notNull().default(30),
  maxHeightCm: doublePrecision("max_height_cm").notNull().default(40),
  minWidthDpi: integer("min_width_dpi").notNull().default(300),
  formats: text("formats").notNull().default("png,jpg,jpeg,svg,pdf"),
});

export type ProductMockup = typeof productMockups.$inferSelect;

/** Saved customizer designs (canvas JSON + files). */
export const savedDesigns = pgTable("saved_designs", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  userId: integer("user_id").notNull(),
  productId: text("product_id").notNull(),
  canvasJson: text("canvas_json"),
  previewUrl: text("preview_url"),
  version: integer("version").notNull().default(1),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type SavedDesign = typeof savedDesigns.$inferSelect;

/** Real notifications. */
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  type: text("type").notNull().default("info"),
  title: text("title").notNull(),
  body: text("body"),
  href: text("href"),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Notification = typeof notifications.$inferSelect;

/** Order-scoped conversation (replaces WhatsApp threads). */
export const orderMessages = pgTable("order_messages", {
  id: serial("id").primaryKey(),
  orderCode: text("order_code").notNull(),
  fromRole: text("from_role").notNull().default("customer"),
  senderName: text("sender_name"),
  body: text("body").notNull(),
  attachment: text("attachment"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type OrderMessage = typeof orderMessages.$inferSelect;

/** Developer profile — editable from the admin. */
export const devProfile = pgTable("dev_profile", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().default("SA ID"),
  role: text("role").notNull().default("Web Developer & Digital Creator"),
  about: text("about"),
  photo: text("photo"),
  whatsapp: text("whatsapp"),
  instagram: text("instagram"),
  email: text("email"),
  skills: text("skills"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  token: text("token").notNull().unique(),
  userId: integer("user_id").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
