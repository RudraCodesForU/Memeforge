import { eq, desc } from "drizzle-orm";
import { db } from "./db";
import { 
  memes, templates, stickers, uploads, users,
  type Meme, type InsertMeme,
  type Template, type InsertTemplate,
  type Sticker, type InsertSticker,
  type Upload, type InsertUpload,
  type User, type InsertUser
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Meme operations
  getMeme(id: number): Promise<Meme | undefined>;
  getAllMemes(): Promise<Meme[]>;
  getPublicMemes(): Promise<Meme[]>;
  createMeme(meme: InsertMeme): Promise<Meme>;
  updateMeme(id: number, updates: Partial<InsertMeme>): Promise<Meme | undefined>;
  deleteMeme(id: number): Promise<boolean>;

  // Template operations
  getTemplate(id: string): Promise<Template | undefined>;
  getAllTemplates(): Promise<Template[]>;
  getPopularTemplates(): Promise<Template[]>;
  createTemplate(template: InsertTemplate): Promise<Template>;

  // Sticker operations
  getSticker(id: string): Promise<Sticker | undefined>;
  getAllStickers(): Promise<Sticker[]>;
  getStickersByCategory(category: string): Promise<Sticker[]>;
  createSticker(sticker: InsertSticker): Promise<Sticker>;

  // Upload operations
  getUpload(id: number): Promise<Upload | undefined>;
  createUpload(upload: InsertUpload): Promise<Upload>;
  deleteUpload(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Meme operations
  async getMeme(id: number): Promise<Meme | undefined> {
    const [meme] = await db.select().from(memes).where(eq(memes.id, id));
    return meme || undefined;
  }

  async getAllMemes(): Promise<Meme[]> {
    return await db.select().from(memes).orderBy(desc(memes.createdAt));
  }

  async getPublicMemes(): Promise<Meme[]> {
    return await db
      .select()
      .from(memes)
      .where(eq(memes.isPublic, true))
      .orderBy(desc(memes.createdAt));
  }

  async createMeme(insertMeme: InsertMeme): Promise<Meme> {
    const [meme] = await db
      .insert(memes)
      .values(insertMeme)
      .returning();
    return meme;
  }

  async updateMeme(id: number, updates: Partial<InsertMeme>): Promise<Meme | undefined> {
    const [meme] = await db
      .update(memes)
      .set(updates)
      .where(eq(memes.id, id))
      .returning();
    return meme || undefined;
  }

  async deleteMeme(id: number): Promise<boolean> {
    const result = await db.delete(memes).where(eq(memes.id, id));
    return result.rowCount > 0;
  }

  // Template operations
  async getTemplate(id: string): Promise<Template | undefined> {
    const [template] = await db.select().from(templates).where(eq(templates.id, id));
    return template || undefined;
  }

  async getAllTemplates(): Promise<Template[]> {
    return await db.select().from(templates);
  }

  async getPopularTemplates(): Promise<Template[]> {
    return await db
      .select()
      .from(templates)
      .where(eq(templates.isPopular, true));
  }

  async createTemplate(template: InsertTemplate): Promise<Template> {
    const [newTemplate] = await db
      .insert(templates)
      .values(template)
      .returning();
    return newTemplate;
  }

  // Sticker operations
  async getSticker(id: string): Promise<Sticker | undefined> {
    const [sticker] = await db.select().from(stickers).where(eq(stickers.id, id));
    return sticker || undefined;
  }

  async getAllStickers(): Promise<Sticker[]> {
    return await db.select().from(stickers);
  }

  async getStickersByCategory(category: string): Promise<Sticker[]> {
    return await db
      .select()
      .from(stickers)
      .where(eq(stickers.category, category));
  }

  async createSticker(sticker: InsertSticker): Promise<Sticker> {
    const [newSticker] = await db
      .insert(stickers)
      .values(sticker)
      .returning();
    return newSticker;
  }

  // Upload operations
  async getUpload(id: number): Promise<Upload | undefined> {
    const [upload] = await db.select().from(uploads).where(eq(uploads.id, id));
    return upload || undefined;
  }

  async createUpload(insertUpload: InsertUpload): Promise<Upload> {
    const [upload] = await db
      .insert(uploads)
      .values(insertUpload)
      .returning();
    return upload;
  }

  async deleteUpload(id: number): Promise<boolean> {
    const result = await db.delete(uploads).where(eq(uploads.id, id));
    return result.rowCount > 0;
  }
}

export const storage = new DatabaseStorage();