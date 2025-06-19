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
    // Seed popular meme templates
    const popularTemplates: Template[] = [
      {
        id: "drake",
        name: "Drake Pointing",
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
        category: "reaction",
        textAreas: [
          { x: 250, y: 100, width: 200, height: 50 },
          { x: 250, y: 250, width: 200, height: 50 }
        ] as any,
        isPopular: true
      },
      {
        id: "distracted",
        name: "Distracted Boyfriend",
        imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400",
        category: "relationship",
        textAreas: [
          { x: 50, y: 50, width: 150, height: 30 },
          { x: 200, y: 50, width: 150, height: 30 },
          { x: 350, y: 50, width: 150, height: 30 }
        ] as any,
        isPopular: true
      },
      {
        id: "woman-cat",
        name: "Woman Yelling at Cat",
        imageUrl: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400",
        category: "reaction",
        textAreas: [
          { x: 50, y: 50, width: 180, height: 40 },
          { x: 270, y: 50, width: 180, height: 40 }
        ],
        isPopular: true
      },
      {
        id: "two-buttons",
        name: "Two Buttons",
        imageUrl: "https://images.unsplash.com/photo-1553484771-371a605b060b?w=400",
        category: "choice",
        textAreas: [
          { x: 100, y: 100, width: 120, height: 30 },
          { x: 280, y: 100, width: 120, height: 30 },
          { x: 200, y: 300, width: 100, height: 50 }
        ],
        isPopular: true
      },
      {
        id: "brain",
        name: "Expanding Brain",
        imageUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400",
        category: "progression",
        textAreas: [
          { x: 250, y: 75, width: 200, height: 30 },
          { x: 250, y: 175, width: 200, height: 30 },
          { x: 250, y: 275, width: 200, height: 30 },
          { x: 250, y: 375, width: 200, height: 30 }
        ],
        isPopular: true
      },
      {
        id: "this-is-fine",
        name: "This is Fine",
        imageUrl: "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=400",
        category: "reaction",
        textAreas: [
          { x: 50, y: 350, width: 200, height: 40 }
        ],
        isPopular: true
      },
      {
        id: "change-mind",
        name: "Change My Mind",
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
        category: "opinion",
        textAreas: [
          { x: 100, y: 250, width: 300, height: 60 }
        ],
        isPopular: true
      },
      {
        id: "success-kid",
        name: "Success Kid",
        imageUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=400",
        category: "success",
        textAreas: [
          { x: 50, y: 50, width: 300, height: 40 },
          { x: 50, y: 350, width: 300, height: 40 }
        ],
        isPopular: true
      }
    ];

    popularTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });

    // Seed funny stickers
    const funnyStickers: Sticker[] = [
      {
        id: "laugh",
        name: "Laughing Emoji",
        imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100",
        category: "emoji",
        tags: ["laugh", "funny", "emoji"]
      },
      {
        id: "thumbs-up",
        name: "Thumbs Up",
        imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100",
        category: "gesture",
        tags: ["thumbs", "approve", "good"]
      },
      {
        id: "fire",
        name: "Fire Emoji",
        imageUrl: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=100",
        category: "emoji",
        tags: ["fire", "hot", "awesome"]
      },
      {
        id: "heart-eyes",
        name: "Heart Eyes",
        imageUrl: "https://images.unsplash.com/photo-1516826957135-700dedea698c?w=100",
        category: "emoji",
        tags: ["love", "heart", "eyes"]
      },
      {
        id: "cry-laugh",
        name: "Crying Laughing",
        imageUrl: "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=100",
        category: "emoji",
        tags: ["cry", "laugh", "funny"]
      },
      {
        id: "mind-blown",
        name: "Mind Blown",
        imageUrl: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=100",
        category: "emoji",
        tags: ["mind", "blown", "shocked"]
      }
    ];

    funnyStickers.forEach(sticker => {
      this.stickers.set(sticker.id, sticker);
    });
  }

  // User operations
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

  // Meme operations
  async getMeme(id: number): Promise<Meme | undefined> {
    return this.memes.get(id);
  }

  async getAllMemes(): Promise<Meme[]> {
    return Array.from(this.memes.values());
  }

  async getPublicMemes(): Promise<Meme[]> {
    return Array.from(this.memes.values()).filter(meme => meme.isPublic);
  }

  async createMeme(insertMeme: InsertMeme): Promise<Meme> {
    const id = this.currentMemeId++;
    const meme: Meme = {
      ...insertMeme,
      id,
      createdAt: new Date(),
      templateId: insertMeme.templateId || null,
      canvasData: insertMeme.canvasData || null,
      metadata: insertMeme.metadata || null,
      tags: insertMeme.tags || null,
      isPublic: insertMeme.isPublic || null
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

  // Template operations
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
      isPopular: template.isPopular || null
    };
    this.templates.set(template.id, fullTemplate);
    return fullTemplate;
  }

  // Sticker operations
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
      tags: sticker.tags || null
    };
    this.stickers.set(sticker.id, fullSticker);
    return fullSticker;
  }

  // Upload operations
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
