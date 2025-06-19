import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
});

export interface MemeGenerationResult {
  imageUrl: string;
  description: string;
  suggestedText: {
    top?: string;
    bottom?: string;
    middle?: string;
  };
}

export async function generateMemeFromPrompt(prompt: string): Promise<MemeGenerationResult> {
  try {
    // First, generate the meme concept and text suggestions
    const conceptResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a meme expert. Generate meme concepts with text suggestions. Respond with JSON in this format: { 'description': string, 'topText': string, 'bottomText': string, 'imagePrompt': string }"
        },
        {
          role: "user",
          content: `Create a funny meme concept based on this prompt: ${prompt}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const concept = JSON.parse(conceptResponse.choices[0].message.content || "{}");

    // Generate the image using DALL-E
    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Create a meme-style image: ${concept.imagePrompt}. The image should be suitable for adding text overlay, with clear areas for text placement.`,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    return {
      imageUrl: imageResponse.data[0].url || "",
      description: concept.description || "AI-generated meme",
      suggestedText: {
        top: concept.topText,
        bottom: concept.bottomText
      }
    };
  } catch (error) {
    console.error("Failed to generate meme:", error);
    throw new Error("Failed to generate meme with AI");
  }
}

export async function analyzeImageForMeme(base64Image: string): Promise<{
  description: string;
  suggestedText: string[];
  memeType: string;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Analyze this image for meme potential. Suggest funny text and identify the meme type. Respond with JSON: { 'description': string, 'suggestedText': string[], 'memeType': string }"
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this image and suggest how to make it into a funny meme."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error("Failed to analyze image:", error);
    throw new Error("Failed to analyze image for meme creation");
  }
}

export async function generateMemeText(context: string, memeType: string = "general"): Promise<{
  topText: string;
  bottomText: string;
  alternatives: string[];
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a meme text generator. Create funny, relevant meme text. Respond with JSON: { 'topText': string, 'bottomText': string, 'alternatives': string[] }"
        },
        {
          role: "user",
          content: `Generate funny meme text for a ${memeType} meme with this context: ${context}`
        }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error("Failed to generate meme text:", error);
    throw new Error("Failed to generate meme text");
  }
}
