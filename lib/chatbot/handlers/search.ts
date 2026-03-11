// lib/chatbot/handlers/search.ts
import type { ChatRequestBody, ChatResponseBody } from "../types";
import { extractSearchJson } from "./extractSearchJson";

export async function handleSearch(body: ChatRequestBody): Promise<ChatResponseBody> {
  try {
    const extracted = await extractSearchJson(body.message || "");

    return {
      message: JSON.stringify(
        {
          status: "Ik ben het aan het checken...",
          extracted,
        },
        null,
        2
      ),
    };
  } catch (error) {
    console.error("handleSearch extraction error:", error);

    return {
      message: JSON.stringify(
        {
          status: "Ik ben het aan het checken...",
          extracted: {
            part: "",
            partNumber: "",
            brand: "",
            model: "",
            year: "",
          },
          error: "Extractie mislukt",
        },
        null,
        2
      ),
    };
  }
}