import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you might want to handle this more gracefully.
  // For this context, we assume the key is always present.
  console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export async function getMileageTip(mpgHistory: number[]): Promise<string> {
  const prompt = `My last few trips had the following miles-per-gallon (MPG) values: ${mpgHistory.join(', ')}. Based on this, provide one concise, actionable tip for improving my car's fuel efficiency. The tip should be easy to understand for a non-expert.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 100,
        thinkingConfig: { thinkingBudget: 50 },
      }
    });
    
    return response.text.trim();
  } catch (error) {
    console.error("Error fetching mileage tip from Gemini:", error);
    throw new Error("Failed to communicate with the AI service.");
  }
}

export async function extractGallonsFromImage(base64Image: string, mimeType: string): Promise<number | null> {
  const prompt = "Analyze the image of this gas pump display. Extract the numeric value for 'gallons'. Return a JSON object with a single key 'gallons'. If the value cannot be determined, return null for 'gallons'.";
  
  const imagePart = {
    inlineData: {
      data: base64Image,
      mimeType: mimeType,
    },
  };

  const textPart = { text: prompt };

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            gallons: {
              type: Type.NUMBER,
              description: 'The number of gallons pumped.'
            }
          }
        }
      }
    });
    
    const jsonString = response.text.trim();
    const result = JSON.parse(jsonString);

    if (result && typeof result.gallons === 'number') {
      return parseFloat(result.gallons.toFixed(2));
    }
    return null;
  } catch (error) {
    console.error("Error extracting gallons from image:", error);
    throw new Error("Failed to analyze the image with the AI service.");
  }
}
