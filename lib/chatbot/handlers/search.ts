// lib/chatbot/handlers/search.ts
import type { ChatRequestBody, ChatResponseBody } from "../types";

export async function handleSearch(_body: ChatRequestBody): Promise<ChatResponseBody> {
  // TODO:
  // - (later) RAG/DB search uitvoeren (Neon/pgvector)
  // - top resultaten ophalen
  // - eventueel LLM gebruiken om het antwoord mooi te formuleren
  return {
    message: "SEARCH intent herkend. (TODO: hier komt later jouw RAG/DB search logic.)",
    suggestions: ["Geef automerk + model + bouwjaar", "Onderdeelnaam", "Part number"],
  };
}