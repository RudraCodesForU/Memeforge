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
    // Seed templates with working image URLs
    this.templates.set("drake", {
      id: "drake",
      name: "Drake Pointing",
      imageUrl: "https://i.imgflip.com/30b1gx.jpg",
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
      imageUrl: "https://i.imgflip.com/1ur9b0.jpg",
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
      imageUrl: "https://i.imgflip.com/1g8my4.jpg",
      category: "choice",
      isPopular: true,
      textAreas: [
        { x: 50, y: 100, width: 100, height: 50 },
        { x: 200, y: 100, width: 100, height: 50 },
        { x: 125, y: 250, width: 150, height: 50 }
      ]
    });

    this.templates.set("woman-yelling-cat", {
      id: "woman-yelling-cat",
      name: "Woman Yelling at Cat",
      imageUrl: "https://i.imgflip.com/345v97.jpg",
      category: "reaction",
      isPopular: true,
      textAreas: [
        { x: 50, y: 50, width: 200, height: 100 },
        { x: 300, y: 50, width: 200, height: 100 }
      ]
    });

    this.templates.set("change-my-mind", {
      id: "change-my-mind",
      name: "Change My Mind",
      imageUrl: "https://i.imgflip.com/24y43o.jpg",
      category: "opinion",
      isPopular: true,
      textAreas: [
        { x: 100, y: 200, width: 300, height: 80 }
      ]
    });

    this.templates.set("success-kid", {
      id: "success-kid",
      name: "Success Kid",
      imageUrl: "https://i.imgflip.com/1bhk.jpg",
      category: "success",
      isPopular: false,
      textAreas: [
        { x: 50, y: 20, width: 200, height: 60 },
        { x: 50, y: 250, width: 200, height: 60 }
      ]
    });

    // Seed stickers with emoji and working SVG icons
    this.stickers.set("laugh", {
      id: "laugh",
      name: "Laughing Emoji",
      imageUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMzAiIGZpbGw9IiNGRkREMDAiIHN0cm9rZT0iI0ZGQUEwMCIgc3Ryb2tlLXdpZHRoPSI0Ii8+CjxjaXJjbGUgY3g9IjIyIiBjeT0iMjQiIHI9IjQiIGZpbGw9IiMwMDAwMDAiLz4KPGNpcmNsZSBjeD0iNDIiIGN5PSIyNCIgcj0iNCIgZmlsbD0iIzAwMDAwMCIvPgo8cGF0aCBkPSJNMTYgNDBRMzIgNTYgNDggNDBRNDAgNDggMzIgNDhRMjQgNDggMTYgNDAiIGZpbGw9IiMwMDAwMDAiLz4KPC9zdmc+",
      category: "emoji",
      tags: ["laugh", "funny", "emoji"]
    });

    this.stickers.set("fire", {
      id: "fire",
      name: "Fire Emoji",
      imageUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMyIDhDMzIgOCAyNiAxNCAyNiAyMkMyNiAzMCAzMiAzNCAzMiAzNEMzMiAzNCAzOCAzMCAzOCAyMkMzOCAxNCAzMiA4IDMyIDhaIiBmaWxsPSIjRkY0NDAwIi8+CjxwYXRoIGQ9Ik0zMiAxNEMzMiAxNCAyOCAyMCAyOCAyNkMyOCAzMiAzMiAzNiAzMiAzNkMzMiAzNiAzNiAzMiAzNiAyNkMzNiAyMCAzMiAxNCAzMiAxNFoiIGZpbGw9IiNGRkFBMDAiLz4KPHBhdGggZD0iTTMyIDIwQzMyIDIwIDMwIDI0IDMwIDI2QzMwIDI4IDMyIDMwIDMyIDMwQzMyIDMwIDM0IDI4IDM0IDI2QzM0IDI0IDMyIDIwIDMyIDIwWiIgZmlsbD0iI0ZGRkZGRiIvPgo8L3N2Zz4=",
      category: "emoji",
      tags: ["fire", "hot", "trending"]
    });

    this.stickers.set("heart", {
      id: "heart",
      name: "Heart Emoji",
      imageUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMyIDU0QzMyIDU0IDEwIDM2IDEwIDIyQzEwIDEwIDIwIDYgMzIgMTZDNDQgNiA1NCAxMCA1NCAyMkM1NCAzNiAzMiA1NCAzMiA1NFoiIGZpbGw9IiNGRjAwNzciLz4KPC9zdmc+",
      category: "emoji",
      tags: ["love", "heart", "like"]
    });

    this.stickers.set("thumbs-up", {
      id: "thumbs-up",
      name: "Thumbs Up",
      imageUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIwIDI4SDE2QzE0IDI4IDEyIDMwIDEyIDMyVjUyQzEyIDU0IDE0IDU2IDE2IDU2SDIwQzIyIDU2IDI0IDU0IDI0IDUyVjMyQzI0IDMwIDIyIDI4IDIwIDI4WiIgZmlsbD0iI0ZGQzY5NCIvPgo8cGF0aCBkPSJNNDggMjhIMzZDMzQgMjggMzQgMjYgMzYgMjRDMzggMjIgNDAgMTggNDAgMTZDNDAgMTIgMzggOCAzNCA4QzMwIDggMjggMTIgMjggMTZWMjhIMjRWNTJINDhDNTAgNTIgNTIgNTAgNTIgNDhWMzJDNTIgMzAgNTAgMjggNDggMjhaIiBmaWxsPSIjRkZDNjk0Ii8+Cjwvc3ZnPg==",
      category: "emoji",
      tags: ["like", "approve", "good"]
    });

    this.stickers.set("mind-blown", {
      id: "mind-blown",
      name: "Mind Blown",
      imageUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMzAiIGZpbGw9IiNGRkREMDAiIHN0cm9rZT0iI0ZGQUEwMCIgc3Ryb2tlLXdpZHRoPSI0Ii8+CjxjaXJjbGUgY3g9IjIyIiBjeT0iMjQiIHI9IjYiIGZpbGw9IiMwMDAwMDAiLz4KPGNpcmNsZSBjeD0iNDIiIGN5PSIyNCIgcj0iNiIgZmlsbD0iIzAwMDAwMCIvPgo8ZWxsaXBzZSBjeD0iMzIiIGN5PSI0NCIgcng9IjEwIiByeT0iNiIgZmlsbD0iIzAwMDAwMCIvPgo8cGF0aCBkPSJNMjAgOEwxNiAxMkwyMCAxNiIgc3Ryb2tlPSIjRkY0NDAwIiBzdHJva2Utd2lkdGg9IjMiIGZpbGw9Im5vbmUiLz4KPHA+dGggZD0iTTQ0IDhMNDggMTJMNDQgMTYiIHN0cm9rZT0iI0ZGNDQwMCIgc3Ryb2tlLXdpZHRoPSIzIiBmaWxsPSJub25lIi8+Cjwvc3ZnPg==",
      category: "emoji",
      tags: ["wow", "surprised", "mind-blown"]
    });

    this.stickers.set("thinking", {
      id: "thinking",
      name: "Thinking Face",
      imageUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMzAiIGZpbGw9IiNGRkREMDAiIHN0cm9rZT0iI0ZGQUEwMCIgc3Ryb2tlLXdpZHRoPSI0Ii8+CjxjaXJjbGUgY3g9IjIyIiBjeT0iMjQiIHI9IjMiIGZpbGw9IiMwMDAwMDAiLz4KPGNpcmNsZSBjeD0iNDIiIGN5PSIyNCIgcj0iMyIgZmlsbD0iIzAwMDAwMCIvPgo8cGF0aCBkPSJNMjggNDBMMzYgNDAiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLXdpZHRoPSIzIiBmaWxsPSJub25lIi8+CjxjaXJjbGUgY3g9IjE2IiBjeT0iMTYiIHI9IjMiIGZpbGw9IiM4ODg4ODgiLz4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMiIgZmlsbD0iIzhBOEE4QSIvPgo8Y2lyY2xlIGN4PSI4IiBjeT0iOCIgcj0iMSIgZmlsbD0iIzhBOEE4QSIvPgo8L3N2Zz4=",
      category: "emoji",
      tags: ["think", "hmm", "consider"]
    });

    this.stickers.set("star", {
      id: "star",
      name: "Star",
      imageUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHA+dGggZD0iTTMyIDhMNDAuNDcgMjNMNTcuNjMgMjNMNDQuMDggMzQuNUw0OC41NSA1MS42M0wzMiA0MC4xM0wxNS40NSA1MS42M0wxOS45MiAzNC41TDYuMzcgMjNMMjMuNTMgMjNMMzIgOFoiIGZpbGw9IiNGRkQwMDAiIHN0cm9rZT0iI0ZGQUEwMCIgc3Ryb2tlLXdpZHRoPSIyIi8+Cjwvc3ZnPg==",
      category: "shapes",
      tags: ["star", "favorite", "rating"]
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
      templateId: insertMeme.templateId || null,
      canvasData: insertMeme.canvasData || null,
      metadata: insertMeme.metadata || null,
      tags: insertMeme.tags || null,
      isPublic: insertMeme.isPublic || false,
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
      textAreas: template.textAreas || null,
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