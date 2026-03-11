// lib/chatbot/handlers/reservation.ts
import type { ChatRequestBody, ChatResponseBody } from "../types";
import Groq from "groq-sdk";

function buildPrompt(body: ChatRequestBody) {
  const message = (body.message || "").trim();
  const history = (body.history || [])
    .slice(-6)
    .map((m) => `${m.sender === "user" ? "Gebruiker" : "Assistant"}: ${m.text}`)
    .join("\n");

  return `
Je bent AutoBot van een autopart shop.

De gebruiker wil waarschijnlijk een onderdeel reserveren of laten klaarleggen.

Jouw taak:
- Antwoord kort en duidelijk
- Bevestig dat je de reserveringsintentie begrijpt
- Vraag alleen om de echt nodige vervolgstappen
- Verzin geen echte reserveringsbevestiging als er nog geen backend-koppeling is

GESCHIEDENIS:
${history || "(geen geschiedenis)"}

GEBRUIKER:
${message}

ASSISTANT:
`.trim();
}

export async function handleReservation(
  body: ChatRequestBody
): Promise<ChatResponseBody> {
  const apiKey = (process.env.GROQ_API_KEY || "").trim();
  const modelName = (process.env.GROQ_MODEL || "llama-3.3-70b-versatile").trim();

  if (!apiKey) {
    return {
      message:
        "Ik heb je reserveringsverzoek ontvangen. Geef het onderdeel en aantal door, dan kan ik je verder helpen.",
      suggestions: ["Welk onderdeel wil je reserveren?", "Hoeveel stuks?", "Wanneer wil je ophalen?"],
    };
  }

  try {
    const client = new Groq({ apiKey });

    const completion = await client.chat.completions.create({
      model: modelName,
      temperature: 0.3,
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
        "Ik heb je reserveringsverzoek ontvangen. Geef het onderdeel en aantal door, dan kan ik je verder helpen.",
      suggestions: ["Welk onderdeel wil je reserveren?", "Hoeveel stuks?", "Wanneer wil je ophalen?"],
    };
  } catch (err) {
    console.error("handleReservation Groq error:", err);

    return {
      message:
        "Ik heb je reserveringsverzoek ontvangen. Geef het onderdeel en aantal door, dan kan ik je verder helpen.",
      suggestions: ["Welk onderdeel wil je reserveren?", "Hoeveel stuks?", "Wanneer wil je ophalen?"],
    };
  }
}