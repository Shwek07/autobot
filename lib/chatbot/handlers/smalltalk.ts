// lib/chatbot/handlers/smalltalk.ts
import type { ChatRequestBody, ChatResponseBody } from "../types";

export async function handleSmalltalk(_body: ChatRequestBody): Promise<ChatResponseBody> {
  // TODO:
  // - (later) eventueel LLM call voor natuurlijke smalltalk
  return {
    message: "Hey! 😄 Waarmee kan ik je helpen? Zoek je een onderdeel of wil je advies?",
    suggestions: ["Onderdelen zoeken", "Auto advies", "Reservering maken"],
  };
}