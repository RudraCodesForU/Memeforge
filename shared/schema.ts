import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const memes = pgTable("memes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  imageUrl: text("image_url").notNull(),
  templateId: text("template_id"),
  canvasData: jsonb("canvas_data"), // Fabric.js canvas state
  metadata: jsonb("metadata"), // Export settings, dimensions, etc.
  tags: text("tags").array(),
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const templates = pgTable("templates", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  imageUrl: text("image_url").notNull(),
  category: text("category").notNull(),
  textAreas: jsonb("text_areas"), // Predefined text positions
  isPopular: boolean("is_popular").default(false),
});

export const stickers = pgTable("stickers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  imageUrl: text("image_url").notNull(),
  category: text("category").notNull(),
  tags: text("tags").array(),
});

export const uploads = pgTable("uploads", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  url: text("url").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertMemeSchema = createInsertSchema(memes).omit({
  id: true,
  createdAt: true,
});

export const insertTemplateSchema = createInsertSchema(templates);

export const insertStickerSchema = createInsertSchema(stickers);

export const insertUploadSchema = createInsertSchema(uploads).omit({
  id: true,
  createdAt: true,
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Types
export type Meme = typeof memes.$inferSelect;
export type InsertMeme = z.infer<typeof insertMemeSchema>;

export type Template = typeof templates.$inferSelect;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;

export type Sticker = typeof stickers.$inferSelect;
export type InsertSticker = z.infer<typeof insertStickerSchema>;

export type Upload = typeof uploads.$inferSelect;
export type InsertUpload = z.infer<typeof insertUploadSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

// Request/Response schemas
export const generateMemeSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  templateId: z.string().optional(),
});

export const exportMemeSchema = z.object({
  canvasData: z.object({}).passthrough(),
  format: z.enum(["png", "jpg", "gif"]).default("png"),
  quality: z.enum(["low", "medium", "high"]).default("medium"),
  optimizeFor: z.enum(["social", "print"]).default("social"),
});

export type GenerateMemeRequest = z.infer<typeof generateMemeSchema>;
export type ExportMemeRequest = z.infer<typeof exportMemeSchema>;
