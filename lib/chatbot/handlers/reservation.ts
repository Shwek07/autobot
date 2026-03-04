// lib/chatbot/handlers/reservation.ts
import type { ChatRequestBody, ChatResponseBody } from "../types";

export async function handleReservation(_body: ChatRequestBody): Promise<ChatResponseBody> {
  // TODO:
  // - (later) reservering aanmaken (function call / DB insert)
  // - voorraad checken
  // - klantgegevens / ophaaldatum vragen
  return {
    message: "RESERVATION intent herkend. (TODO: hier komt later jouw reservering-logic.)",
    suggestions: ["Welk onderdeel wil je reserveren?", "Hoeveel stuks?", "Wanneer wil je ophalen?"],
  };
}