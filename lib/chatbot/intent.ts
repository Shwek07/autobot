// lib/chatbot/intent.ts

import type { ChatRequestBody, IntentResult, IntentName } from "./types";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

const DecisionSchema = z.object({
  intent: z.enum(["SEARCH", "RESERVATION", "GENERAL", "SMALLTALK"]),
  confidence: z.number().min(0).max(1),
});

function buildIntentPrompt(body: ChatRequestBody) {
  const system = `
Je bent een intent-classifier voor een autopart shop chatbot (AutoBot).
Je taak is ALLEEN: bepaal welke intent de gebruiker bedoelt.
Je antwoord moet ALLEEN JSON zijn.
`.trim();

  const developer = `
Je herkent exact 3 intents:

1) SEARCH:
- De gebruiker zoekt een onderdeel / vraagt voorraad / prijs / beschikbaarheid / "hebben jullie dit?"
- Ook vage zinnen vallen hieronder, bv: "Hebben jullie zo iets?", "Heb je dat voor mijn auto?", "Is dit op voorraad?"

2) RESERVATION:
- Gebruiker wil reserveren/bestellen/iets laten klaarleggen of ophalen.

3) GENERAL:
- Auto-advies, uitleg, onderhoud, problemen/klachten (niet direct onderdelen zoeken).

OUT OF SCOPE (heel belangrijk):
- Als de user iets vraagt dat NIET over auto-onderdelen, autoparts, auto-onderhoud of auto-problemen gaat
  (bv. random chit-chat, school, politiek, koken, etc),
  dan kies je GENERAL (niet SEARCH/RESERVATION).
  We gaan dat soort vragen niet behandelen; we sturen de user terug naar de autoparts topics.

Output format (ALTIJD):
{ "intent": "SEARCH|RESERVATION|GENERAL", "confidence": 0.0-1.0 }

Voorbeelden:
User: "Hebben jullie remblokken voor Toyota Vitz 2012?" -> SEARCH
User: "Hebben jullie zo iets?" -> SEARCH
User: "Kan je 2 remblokken apart houden voor morgen?" -> RESERVATION
User: "Mijn auto trilt bij remmen, wat kan het zijn?" -> GENERAL
User: "Hoe gaat het?" -> GENERAL (out of scope)
User: "Wat is de hoofdstad van Frankrijk?" -> GENERAL (out of scope)
`.trim();

  const history = (body.history || [])
    .slice(-6)
    .map((m) => `${m.sender === "user" ? "User" : "Assistant"}: ${m.text}`)
    .join("\n");

  const user = `User message: ${(body.message || "").trim()}\n\nRecent history:\n${history || "(none)"}`;

  return `SYSTEM:\n${system}\n\nDEVELOPER:\n${developer}\n\n${user}`;
}

export async function detectIntent(body: ChatRequestBody): Promise<IntentResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { intent: "GENERAL", confidence: 0.3 };

  const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json",
      },
    });

    const prompt = buildIntentPrompt(body);
    const result = await model.generateContent(prompt);
    const text = result.response.text()?.trim() || "{}";

    const parsed = DecisionSchema.parse(JSON.parse(text));
    return { intent: parsed.intent as IntentName, confidence: parsed.confidence };
  } catch {
    return { intent: "GENERAL", confidence: 0.4 };
  }
}

// Dit manier van intent is verkeerd, je moet het zodanig maken dat alles gewoon naar je LLM gaat en daar kan het achterhalen dat de user prompt een synoniem 
// is van wat al in de intent staat en dat ga je mee sturen met die system or developer prompt. Dan geeft het dat terug en dan kan je dan in je intent zoeken.
// je en ook edge cases, als iets fout gaat bij het uitvoeren.