import { db } from "./db";
import { templates, stickers } from "@shared/schema";

export async function seedDatabase() {
  try {
    // Check if data already exists
    const existingTemplates = await db.select().from(templates).limit(1);
    if (existingTemplates.length > 0) {
      console.log("Database already seeded");
      return;
    }

    // Seed templates
    await db.insert(templates).values([
      {
        id: "drake",
        name: "Drake Pointing",
        imageUrl: "https://imgflip.com/s/meme/Drake-Pointing.jpg",
        category: "reaction",
        isPopular: true,
        textAreas: [
          { x: 50, y: 50, width: 200, height: 100 },
          { x: 50, y: 200, width: 200, height: 100 }
        ]
      },
      {
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
      },
      {
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
      },
      {
        id: "woman-yelling-cat",
        name: "Woman Yelling at Cat",
        imageUrl: "https://imgflip.com/s/meme/Woman-Yelling-At-Cat.jpg",
        category: "reaction",
        isPopular: true,
        textAreas: [
          { x: 50, y: 50, width: 200, height: 100 },
          { x: 300, y: 50, width: 200, height: 100 }
        ]
      },
      {
        id: "change-my-mind",
        name: "Change My Mind",
        imageUrl: "https://imgflip.com/s/meme/Change-My-Mind.jpg",
        category: "opinion",
        isPopular: true,
        textAreas: [
          { x: 100, y: 200, width: 300, height: 80 }
        ]
      },
      {
        id: "expanding-brain",
        name: "Expanding Brain",
        imageUrl: "https://imgflip.com/s/meme/Expanding-Brain.png",
        category: "evolution",
        isPopular: false,
        textAreas: [
          { x: 200, y: 50, width: 200, height: 50 },
          { x: 200, y: 150, width: 200, height: 50 },
          { x: 200, y: 250, width: 200, height: 50 },
          { x: 200, y: 350, width: 200, height: 50 }
        ]
      }
    ]);

    // Seed stickers
    await db.insert(stickers).values([
      {
        id: "laugh",
        name: "Laughing Emoji",
        imageUrl: "😂",
        category: "emoji",
        tags: ["laugh", "funny", "emoji"]
      },
      {
        id: "fire",
        name: "Fire Emoji",
        imageUrl: "🔥",
        category: "emoji",
        tags: ["fire", "hot", "trending"]
      },
      {
        id: "heart",
        name: "Heart Emoji",
        imageUrl: "❤️",
        category: "emoji",
        tags: ["love", "heart", "like"]
      },
      {
        id: "thumbs-up",
        name: "Thumbs Up",
        imageUrl: "👍",
        category: "emoji",
        tags: ["like", "approve", "good"]
      },
      {
        id: "mind-blown",
        name: "Mind Blown",
        imageUrl: "🤯",
        category: "emoji",
        tags: ["wow", "surprised", "mind-blown"]
      },
      {
        id: "crying-laugh",
        name: "Crying Laughing",
        imageUrl: "😭",
        category: "emoji",
        tags: ["cry", "laugh", "funny"]
      },
      {
        id: "thinking",
        name: "Thinking Face",
        imageUrl: "🤔",
        category: "emoji",
        tags: ["think", "hmm", "consider"]
      },
      {
        id: "shrug",
        name: "Shrug",
        imageUrl: "🤷‍♂️",
        category: "emoji",
        tags: ["shrug", "dunno", "whatever"]
      }
    ]);

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}