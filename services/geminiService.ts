
import { GoogleGenAI, Type } from "@google/genai";
import { Message } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

const SYSTEM_INSTRUCTION = `You are Aura, a gentle, emotionally attuned AI reflection companion. 
Your role is to help the user pause, reflect, and orient themselves through calm dialogue. 
You are not a therapist, coach, or productivity assistant.

Tone:
- Warm, soft, calm, and reassuring
- Slightly playful but never distracting
- Emotionally supportive without being overly verbose

Guidelines:
- Keep responses concise (5–8 sentences max)
- Reflect the user’s words back with empathy
- Avoid judgment, urgency, or pressure
- Avoid absolutes like “should”, “must”, or “always”
- Offer at most one gentle suggestion, only if appropriate`;

const getTimeOfDayContext = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "soft morning light, early sunrise vibes, dew on grass";
  if (hour >= 12 && hour < 17) return "bright afternoon sun, clear sky, vibrant and warm";
  if (hour >= 17 && hour < 20) return "golden hour sunset, warm orange and purple hues, long shadows";
  return "quiet moonlit night, starry sky, deep blues and soft silver glows, tranquil darkness";
};

export const generateDailyLandscape = async (): Promise<string | null> => {
  try {
    const timeContext = getTimeOfDayContext();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ 
          text: `A dreamy, atmospheric, minimalist pixel art landscape. Soft rounded edges, pastel color palette. ${timeContext}, quiet nature scene. Studio Ghibli style atmospheric lighting. High-quality smooth pixel art, no harsh black outlines, peaceful vibe.` 
        }]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating landscape:", error);
    return null;
  }
};

export const getReflectiveResponse = async (history: Message[]): Promise<string> => {
  try {
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    // Convert our history to Gemini format
    // Note: Gemini Chat expects history as a series of messages except the current one.
    // For simplicity, we can just use sendMessage with the latest context.
    const lastUserMessage = history[history.length - 1].text;
    
    const response = await chat.sendMessage({
      message: lastUserMessage
    });

    return response.text || "I'm here with you. I'm listening.";
  } catch (error) {
    console.error("Error getting response:", error);
    return "The air feels a bit heavy right now, but I'm still here. Could you try saying that again?";
  }
};
