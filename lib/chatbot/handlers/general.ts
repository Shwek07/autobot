// lib/chatbot/handlers/general.ts
import type { ChatRequestBody, ChatResponseBody } from "../types";
import { GoogleGenerativeAI } from "@google/generative-ai";

function buildPrompt(body: ChatRequestBody) {
  const system =
    "Je bent AutoBot, een behulpzame AI-assistent voor auto-onderdelen en auto-advies. " +
    "Antwoord kort en duidelijk in het Nederlands. " +
    "Als info ontbreekt, vraag om automerk, model, bouwjaar en motorvariant. " +
    "Geef praktische, veilige adviezen (geen gevaarlijke instructies).";

  const history = (body.history || [])
    .slice(-10)
    .map((m) => `${m.sender === "user" ? "User" : "Assistant"}: ${m.text}`)
    .join("\n");

  const msg = (body.message || "").trim();

  return `${system}\n\n${history}\nUser: ${msg}\nAssistant:`;
}

export async function handleGeneral(body: ChatRequestBody): Promise<ChatResponseBody> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      message: "Server configuratie fout: GEMINI_API_KEY ontbreekt in .env.local.",
      suggestions: ["Check je .env.local", "Herstart npm run dev"],
    };
  }

  const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash-latest";

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    const prompt = buildPrompt(body);

    const result = await model.generateContent(prompt);
    const reply = result.response.text()?.trim();

    return {
      message: reply && reply.length > 0 ? reply : "Ik kon geen antwoord genereren.",
      suggestions: ["Onderdelen zoeken", "Compatibiliteit check", "Reservering maken"],
    };
  } catch (err: any) {
  console.error("❌ handleGeneral Gemini error:", err);
  throw err; 

  }
}