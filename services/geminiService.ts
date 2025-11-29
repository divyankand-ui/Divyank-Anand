import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysis } from "../types";

const initGemini = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const analyzeExpense = async (description: string, amount: number, type: string): Promise<AIAnalysis> => {
  const ai = initGemini();
  if (!ai) {
    throw new Error("Gemini API Key is missing.");
  }

  const prompt = `
    Analyze this expense:
    Description: ${description}
    Amount: $${amount}
    Type: ${type}

    Provide a JSON response with:
    1. category: One word category (e.g. Food, Transport, Utilities, Entertainment).
    2. tip: A short, helpful or funny financial tip regarding this spending.
    3. isWasteful: boolean, true if it seems like a luxury or unnecessary expense.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            tip: { type: Type.STRING },
            isWasteful: { type: Type.BOOLEAN }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as AIAnalysis;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};
