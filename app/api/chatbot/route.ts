// app/api/chatbot/route.ts
import { NextResponse } from "next/server";
import { detectIntent } from "@/lib/chatbot/intent";
import type { ChatRequestBody, ChatResponseBody } from "@/lib/chatbot/types";

import { handleSearch } from "@/lib/chatbot/handlers/search";
import { handleReservation } from "@/lib/chatbot/handlers/reservation";
import { handleSmalltalk } from "@/lib/chatbot/handlers/smalltalk";
import { handleGeneral } from "@/lib/chatbot/handlers/general";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ChatRequestBody;
    const intentResult = await detectIntent(body);

    let response: ChatResponseBody;

    switch (intentResult.intent) {
      case "SEARCH":
        response = await handleSearch(body);
        break;
      case "RESERVATION":
        response = await handleReservation(body);
        break;
      case "SMALLTALK":
        response = await handleSmalltalk(body);
        break;
      default:
        response = await handleGeneral(body);
        break;
    }

    // (optioneel) intent teruggeven naar frontend voor debug
    response.intent = intentResult.intent;

    return NextResponse.json(response);
 } catch (err: any) {
  console.error("❌ /api/chatbot error:", err);

  // Detecteer Gemini / API key errors
  const message = err?.message?.toLowerCase() ?? "";

  const isGeminiDown =
    message.includes("api key") ||
    message.includes("unauthorized") ||
    message.includes("quota") ||
    message.includes("429") ||
    message.includes("503");

  if (isGeminiDown) {
    console.error("🚨 Gemini API is down of API key ongeldig");

    return NextResponse.json(
      { message: "AI_SERVICE_DOWN" },
      { status: 503 }
    );
  }

  // Fallback: algemene server error
  return NextResponse.json(
    { message: "Server error in chatbot route." },
    { status: 500 }
  );
}

}