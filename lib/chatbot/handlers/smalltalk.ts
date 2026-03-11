// lib/chatbot/handlers/smalltalk.ts
import type { ChatRequestBody, ChatResponseBody } from "../types";
import Groq from "groq-sdk";

function buildPrompt(body: ChatRequestBody) {
  const message = (body.message || "").trim();

  return `
Je bent AutoBot van een autopart shop.

De gebruiker stuurt smalltalk of een korte sociale boodschap.

Jouw taak:
- Reageer vriendelijk en kort
- Houd het natuurlijk
- Stuur daarna subtiel terug naar auto-onderdelen of auto-vragen

Voorbeeldstijl:
- "Hallo! Waarmee kan ik je helpen? Je kunt bijvoorbeeld zoeken op onderdeelnaam of part number."
- "Graag gedaan! Heb je een onderdeel nodig of een vraag over je auto?"

Gebruiker:
${message}

Assistant:
`.trim();
}

export async function handleSmalltalk(
  body: ChatRequestBody
): Promise<ChatResponseBody> {
  const apiKey = (process.env.GROQ_API_KEY || "").trim();
  const modelName = (process.env.GROQ_MODEL || "llama-3.3-70b-versatile").trim();

  if (!apiKey) {
    return {
      message:
        "Hallo! Ik help je graag met auto-onderdelen, part numbers en auto-gerelateerde vragen.",
      suggestions: ["Zoek onderdeel", "Zoek op part number", "Auto vraag stellen"],
    };
  }

  try {
    const client = new Groq({ apiKey });

    const completion = await client.chat.completions.create({
      model: modelName,
      temperature: 0.5,
      messages: [
        {
          role: "user",
          content: buildPrompt(body),
        },
      ],
    });

    const reply = completion.choices?.[0]?.message?.content?.trim();

    return {
      message:
        reply ||
        "Hallo! Ik help je graag met auto-onderdelen, part numbers en auto-gerelateerde vragen.",
      suggestions: ["Zoek onderdeel", "Zoek op part number", "Auto vraag stellen"],
    };
  } catch (err) {
    console.error("handleSmalltalk Groq error:", err);

    return {
      message:
        "Hallo! Ik help je graag met auto-onderdelen, part numbers en auto-gerelateerde vragen.",
      suggestions: ["Zoek onderdeel", "Zoek op part number", "Auto vraag stellen"],
    };
  }
}