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
    return (result.rowCount || 0) > 0;
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

// For immediate testing without database setup, use MemStorage
// export const storage = new DatabaseStorage();

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private memes: Map<number, Meme> = new Map();
  private templates: Map<string, Template> = new Map();
  private stickers: Map<string, Sticker> = new Map();
  private uploads: Map<number, Upload> = new Map();
  
  private currentUserId = 1;
  private currentMemeId = 1;
  private currentUploadId = 1;

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed templates
    this.templates.set("drake", {
      id: "drake",
      name: "Drake Pointing",
      imageUrl: "https://imgflip.com/s/meme/Drake-Pointing.jpg",
      category: "reaction",
      isPopular: true,
      textAreas: [
        { x: 50, y: 50, width: 200, height: 100 },
        { x: 50, y: 200, width: 200, height: 100 }
      ]
    });

    this.templates.set("distracted-boyfriend", {
      id: "distracted-boyfriend",
      name: "Distracted Boyfriend",
      imageUrl: "https://imgflip.com/s/meme/Distracted-Boyfriend.jpg",
      category: "relationship",
      isPopular: true,
      textAreas: [
        { x: 10, y: 10, width: 150, height: 50 },
        { x: 200, y: 10, width: 150, height: 50 },
        { x: 350, y: 10, width: 150, height: 50 }
      ]
    });

    this.templates.set("two-buttons", {
      id: "two-buttons",
      name: "Two Buttons",
      imageUrl: "https://imgflip.com/s/meme/Two-Buttons.jpg",
      category: "choice",
      isPopular: true,
      textAreas: [
        { x: 50, y: 100, width: 100, height: 50 },
        { x: 200, y: 100, width: 100, height: 50 },
        { x: 125, y: 250, width: 150, height: 50 }
      ]
    });

    // Seed stickers
    this.stickers.set("laugh", {
      id: "laugh",
      name: "Laughing Emoji",
      imageUrl: "😂",
      category: "emoji",
      tags: ["laugh", "funny", "emoji"]
    });

    this.stickers.set("fire", {
      id: "fire",
      name: "Fire Emoji",
      imageUrl: "🔥",
      category: "emoji",
      tags: ["fire", "hot", "trending"]
    });

    this.stickers.set("heart", {
      id: "heart",
      name: "Heart Emoji",
      imageUrl: "❤️",
      category: "emoji",
      tags: ["love", "heart", "like"]
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getMeme(id: number): Promise<Meme | undefined> {
    return this.memes.get(id);
  }

  async getAllMemes(): Promise<Meme[]> {
    return Array.from(this.memes.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getPublicMemes(): Promise<Meme[]> {
    return Array.from(this.memes.values())
      .filter(meme => meme.isPublic)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async createMeme(insertMeme: InsertMeme): Promise<Meme> {
    const id = this.currentMemeId++;
    const meme: Meme = {
      ...insertMeme,
      id,
      createdAt: new Date()
    };
    this.memes.set(id, meme);
    return meme;
  }

  async updateMeme(id: number, updates: Partial<InsertMeme>): Promise<Meme | undefined> {
    const meme = this.memes.get(id);
    if (!meme) return undefined;
    const updatedMeme = { ...meme, ...updates };
    this.memes.set(id, updatedMeme);
    return updatedMeme;
  }

  async deleteMeme(id: number): Promise<boolean> {
    return this.memes.delete(id);
  }

  async getTemplate(id: string): Promise<Template | undefined> {
    return this.templates.get(id);
  }

  async getAllTemplates(): Promise<Template[]> {
    return Array.from(this.templates.values());
  }

  async getPopularTemplates(): Promise<Template[]> {
    return Array.from(this.templates.values()).filter(template => template.isPopular);
  }

  async createTemplate(template: InsertTemplate): Promise<Template> {
    const fullTemplate: Template = {
      ...template,
      isPopular: template.isPopular || false
    };
    this.templates.set(template.id, fullTemplate);
    return fullTemplate;
  }

  async getSticker(id: string): Promise<Sticker | undefined> {
    return this.stickers.get(id);
  }

  async getAllStickers(): Promise<Sticker[]> {
    return Array.from(this.stickers.values());
  }

  async getStickersByCategory(category: string): Promise<Sticker[]> {
    return Array.from(this.stickers.values()).filter(sticker => sticker.category === category);
  }

  async createSticker(sticker: InsertSticker): Promise<Sticker> {
    const fullSticker: Sticker = {
      ...sticker,
      tags: sticker.tags || []
    };
    this.stickers.set(sticker.id, fullSticker);
    return fullSticker;
  }

  async getUpload(id: number): Promise<Upload | undefined> {
    return this.uploads.get(id);
  }

  async createUpload(insertUpload: InsertUpload): Promise<Upload> {
    const id = this.currentUploadId++;
    const upload: Upload = {
      ...insertUpload,
      id,
      createdAt: new Date()
    };
    this.uploads.set(id, upload);
    return upload;
  }

  async deleteUpload(id: number): Promise<boolean> {
    return this.uploads.delete(id);
  }
}

export const storage = new MemStorage();