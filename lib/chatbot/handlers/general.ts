// lib/chatbot/handlers/general.ts
import type { ChatRequestBody, ChatResponseBody } from "../types";
import Groq from "groq-sdk";

function buildPrompt(body: ChatRequestBody) {
  const system = `
Je bent AutoBot, een behulpzame AI-assistent voor een autopart shop.

Je helpt alleen met:
- auto-onderdelen
- auto-onderhoud
- auto-problemen
- eenvoudige productgerichte vragen

Regels:
- Antwoord kort, duidelijk en praktisch
- Blijf binnen de context van auto's en auto-onderdelen
- Als de vraag buiten scope is, stuur de gebruiker netjes terug naar auto-gerelateerde onderwerpen
- Verzin geen voorraad, prijs of beschikbaarheid als je die niet zeker weet
- Geef geen onnodig lange uitleg
`.trim();

  const history = (body.history || [])
    .slice(-6)
    .map((m) => `${m.sender === "user" ? "Gebruiker" : "Assistant"}: ${m.text}`)
    .join("\n");

  return `
SYSTEM:
${system}

GESCHIEDENIS:
${history || "(geen geschiedenis)"}

GEBRUIKER:
${(body.message || "").trim()}

ASSISTANT:
`.trim();
}

export async function handleGeneral(
  body: ChatRequestBody
): Promise<ChatResponseBody> {
  const apiKey = (process.env.GROQ_API_KEY || "").trim();
  const modelName = (process.env.GROQ_MODEL || "llama-3.3-70b-versatile").trim();

  if (!apiKey) {
    return {
      message:
        "Ik kan je helpen met auto-onderdelen, auto-onderhoud en auto-gerelateerde vragen.",
      suggestions: [
        "Ik zoek een onderdeel",
        "Mijn auto maakt een geluid",
        "Zoek op part number",
      ],
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
        "Ik kan je helpen met auto-onderdelen, auto-onderhoud en auto-gerelateerde vragen.",
      suggestions: [
        "Ik zoek een onderdeel",
        "Mijn auto maakt een geluid",
        "Zoek op part number",
      ],
    };
  } catch (err) {
    console.error("handleGeneral Groq error:", err);

    return {
      message:
        "Er ging iets mis met de AI-service. Probeer opnieuw of stel een vraag over een auto-onderdeel.",
      suggestions: [
        "Zoek remblokken",
        "Zoek op part number",
        "Auto-onderhoud vraag",
      ],
    };
  }
}