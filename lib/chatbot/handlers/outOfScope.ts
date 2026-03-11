// lib/chatbot/handlers/outOfScope.ts
import type { ChatRequestBody, ChatResponseBody } from "../types";
import Groq from "groq-sdk";

function buildPrompt(body: ChatRequestBody) {
  const message = (body.message || "").trim();

  return `
Je bent AutoBot, een chatbot van een autopart shop.

De gebruiker heeft een vraag gesteld die BUITEN de scope valt van auto-onderdelen zoeken en reserveren.

Jouw taak:
- Antwoord vriendelijk en kort op de vraag van de gebruiker
- Zeg daarna duidelijk dat je alleen helpt met auto-onderdelen zoeken en reserveren
- Stuur de gebruiker daarna netjes terug naar de autopart shop context

Antwoordstijl:
- Kort
- Duidelijk
- Vriendelijk
- Geen lange uitleg

Gebruiker:
${message}

Assistant:
`.trim();
}

export async function handleOutOfScope(
  body: ChatRequestBody
): Promise<ChatResponseBody> {
  const apiKey = (process.env.GROQ_API_KEY || "").trim();
  const modelName = (process.env.GROQ_MODEL || "llama-3.3-70b-versatile").trim();

  if (!apiKey) {
    return {
      message:
        "Ik help alleen met auto-onderdelen zoeken en reserveren. Stel gerust een vraag over een onderdeel of een reservering.",
      suggestions: ["Onderdelen zoeken", "Reservering maken", "Zoek op part number"],
    };
  }

  try {
    const client = new Groq({ apiKey });

    const completion = await client.chat.completions.create({
      model: modelName,
      temperature: 0.4,
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
        "Ik help alleen met auto-onderdelen zoeken en reserveren. Stel gerust een vraag over een onderdeel of een reservering.",
      suggestions: ["Onderdelen zoeken", "Reservering maken", "Zoek op part number"],
    };
  } catch (err) {
    console.error("handleOutOfScope Groq error:", err);

    return {
      message:
        "Ik help alleen met auto-onderdelen zoeken en reserveren. Stel gerust een vraag over een onderdeel of een reservering.",
      suggestions: ["Onderdelen zoeken", "Reservering maken", "Zoek op part number"],
    };
  }
}