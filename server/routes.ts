import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { 
  generateMemeSchema, 
  exportMemeSchema,
  insertMemeSchema,
  insertUploadSchema
} from "@shared/schema";
import { generateMemeFromPrompt, analyzeImageForMeme, generateMemeText } from "./services/openai";
import { processCanvasExport, optimizeImageForUpload, generateThumbnail } from "./services/imageProcessor";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Templates API
  app.get("/api/templates", async (req, res) => {
    try {
      const templates = await storage.getAllTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  app.get("/api/templates/popular", async (req, res) => {
    try {
      const templates = await storage.getPopularTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch popular templates" });
    }
  });

  app.get("/api/templates/:id", async (req, res) => {
    try {
      const template = await storage.getTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch template" });
    }
  });

  // Stickers API
  app.get("/api/stickers", async (req, res) => {
    try {
      const { category } = req.query;
      const stickers = category 
        ? await storage.getStickersByCategory(category as string)
        : await storage.getAllStickers();
      res.json(stickers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stickers" });
    }
  });

  app.get("/api/stickers/:id", async (req, res) => {
    try {
      const sticker = await storage.getSticker(req.params.id);
      if (!sticker) {
        return res.status(404).json({ message: "Sticker not found" });
      }
      res.json(sticker);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sticker" });
    }
  });

  // File Upload API
  app.post("/api/upload", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const { buffer: optimizedBuffer, metadata } = await optimizeImageForUpload(
        req.file.buffer, 
        req.file.originalname
      );

      // In a real app, you would save to cloud storage (S3, Cloudinary, etc.)
      // For this demo, we'll create a data URL
      const base64 = optimizedBuffer.toString('base64');
      const dataUrl = `data:${req.file.mimetype};base64,${base64}`;

      const uploadRecord = await storage.createUpload({
        filename: `upload_${Date.now()}_${req.file.originalname}`,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: optimizedBuffer.length,
        url: dataUrl
      });

      res.json({
        id: uploadRecord.id,
        url: uploadRecord.url,
        metadata
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  // AI Meme Generation API
  app.post("/api/generate-meme", async (req, res) => {
    try {
      const validation = generateMemeSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid request", 
          errors: validation.error.issues 
        });
      }

      const { prompt, templateId } = validation.data;

      if (templateId) {
        // Generate text for existing template
        const template = await storage.getTemplate(templateId);
        if (!template) {
          return res.status(404).json({ message: "Template not found" });
        }

        const textSuggestions = await generateMemeText(prompt, template.category);
        res.json({
          templateId,
          template,
          suggestedText: textSuggestions
        });
      } else {
        // Generate completely new meme with AI
        const result = await generateMemeFromPrompt(prompt);
        res.json(result);
      }
    } catch (error) {
      console.error("Generate meme error:", error);
      res.status(500).json({ message: "Failed to generate meme" });
    }
  });

  // Analyze uploaded image for meme potential
  app.post("/api/analyze-image", async (req, res) => {
    try {
      const { imageData } = req.body;
      if (!imageData) {
        return res.status(400).json({ message: "Image data required" });
      }

      // Extract base64 data
      const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
      const analysis = await analyzeImageForMeme(base64Data);
      
      res.json(analysis);
    } catch (error) {
      console.error("Image analysis error:", error);
      res.status(500).json({ message: "Failed to analyze image" });
    }
  });

  // Memes API
  app.get("/api/memes", async (req, res) => {
    try {
      const { public_only } = req.query;
      const memes = public_only === 'true' 
        ? await storage.getPublicMemes()
        : await storage.getAllMemes();
      res.json(memes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch memes" });
    }
  });

  app.get("/api/memes/:id", async (req, res) => {
    try {
      const meme = await storage.getMeme(parseInt(req.params.id));
      if (!meme) {
        return res.status(404).json({ message: "Meme not found" });
      }
      res.json(meme);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch meme" });
    }
  });

  app.post("/api/memes", async (req, res) => {
    try {
      const validation = insertMemeSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid meme data", 
          errors: validation.error.issues 
        });
      }

      const meme = await storage.createMeme(validation.data);
      res.status(201).json(meme);
    } catch (error) {
      console.error("Create meme error:", error);
      res.status(500).json({ message: "Failed to create meme" });
    }
  });

  app.put("/api/memes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validation = insertMemeSchema.partial().safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid meme data", 
          errors: validation.error.issues 
        });
      }

      const meme = await storage.updateMeme(id, validation.data);
      if (!meme) {
        return res.status(404).json({ message: "Meme not found" });
      }
      res.json(meme);
    } catch (error) {
      res.status(500).json({ message: "Failed to update meme" });
    }
  });

  app.delete("/api/memes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteMeme(id);
      if (!deleted) {
        return res.status(404).json({ message: "Meme not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete meme" });
    }
  });

  // Export meme with processing
  app.post("/api/export-meme", async (req, res) => {
    try {
      const validation = exportMemeSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid export data", 
          errors: validation.error.issues 
        });
      }

      const { canvasData, format, quality, optimizeFor } = validation.data;
      
      // Process the canvas data URL into optimized image
      const processedBuffer = await processCanvasExport(canvasData as any, {
        format,
        quality,
        optimizeFor
      });

      // Set appropriate headers
      const mimeTypes = {
        png: 'image/png',
        jpg: 'image/jpeg',
        gif: 'image/gif'
      };

      res.set({
        'Content-Type': mimeTypes[format],
        'Content-Disposition': `attachment; filename="meme.${format}"`
      });

      res.send(processedBuffer);
    } catch (error) {
      console.error("Export error:", error);
      res.status(500).json({ message: "Failed to export meme" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
