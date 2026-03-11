import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

export interface AnalysisResult {
  title: string;
  summary: string;
  keyPoints: string[];
  extendedInsights: string[];
  suggestedSlides: {
    title: string;
    content: string[];
  }[];
}

export async function analyzePDFs(
  files: { name: string; data: string }[],
  language: 'en' | 'zh-TW' = 'zh-TW'
): Promise<AnalysisResult> {
  if (!apiKey) {
    throw new Error("Gemini API key is not configured.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const parts = files.map(file => ({
    inlineData: {
      mimeType: "application/pdf",
      data: file.data.split(',')[1] // Remove the data:application/pdf;base64, prefix
    }
  }));

  const languageName = language === 'zh-TW' ? 'Traditional Chinese (繁體中文)' : 'English';

  const prompt = `
    Analyze the following PDF documents. 
    Provide a comprehensive analysis in ${languageName} including:
    1. A clear title for the combined analysis.
    2. A high-level summary.
    3. Key points extracted from the documents.
    4. Extended learning insights (what else should the user learn based on this content?).
    5. A structure for a presentation (at least 5-8 slides) with titles and bullet points.

    Return the result in JSON format.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        ...parts,
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          summary: { type: Type.STRING },
          keyPoints: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          extendedInsights: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          suggestedSlides: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                content: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ["title", "content"]
            }
          }
        },
        required: ["title", "summary", "keyPoints", "extendedInsights", "suggestedSlides"]
      }
    }
  });

  try {
    return JSON.parse(response.text || "{}") as AnalysisResult;
  } catch (e) {
    console.error("Failed to parse AI response", e);
    throw new Error("Failed to analyze PDFs. Please try again.");
  }
}
