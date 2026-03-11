// lib/chatbot/intent.ts

import type { ChatRequestBody, IntentResult, IntentName } from "./types";
import Groq from "groq-sdk";
import { z } from "zod";

const DecisionSchema = z.object({
  intent: z.enum(["SEARCH", "RESERVATION", "GENERAL", "SMALLTALK"]),
  confidence: z.number().min(0).max(1),
});

function buildIntentPrompt(body: ChatRequestBody) {
  const system = `
Je bent een intent-classifier voor een autopart shop chatbot (AutoBot).
Je taak is ALLEEN: bepaal welke intent de gebruiker bedoelt.
Je antwoord moet ALLEEN geldige JSON zijn.
Geen extra tekst.
`.trim();

  const developer = `
Je herkent exact 4 intents:

1) SEARCH
- De gebruiker zoekt een auto-onderdeel
- Vraagt naar prijs, voorraad, beschikbaarheid, compatibiliteit
- Vraagt op basis van part number / onderdeelnummer
- Ook vage zoekvragen vallen hieronder

Voorbeelden:
- "Hebben jullie remblokken voor Toyota Vitz 2012?"
- "Ik zoek een waterpomp"
- "Hebben jullie dit op voorraad?"
- "Ik heb part number 04465-0D140"
- "Past dit onderdeel op een Nissan March?"

2) RESERVATION
- Gebruiker wil reserveren, bestellen, laten klaarleggen, ophalen
- Ook intenties zoals "hou dit vast", "ik wil dit morgen ophalen"

Voorbeelden:
- "Kan je 2 remblokken voor mij apart houden?"
- "Ik wil dit onderdeel reserveren"
- "Leg deze accu voor me klaar"

3) GENERAL
- Algemene auto-vragen
- Auto-onderhoud
- Auto-problemen / klachten / advies
- Vragen die niet direct product search of reservation zijn

Voorbeelden:
- "Mijn auto trilt bij het remmen, wat kan het zijn?"
- "Wanneer moet ik mijn olie vervangen?"
- "Wat doet een distributieriem?"

4) SMALLTALK
- Begroetingen
- Bedanken
- Casual smalltalk
- Korte sociale berichten

Voorbeelden:
- "Hallo"
- "Hoe gaat het?"
- "Dankjewel"
- "Top"

BELANGRIJK:
- Alles buiten auto-onderdelen, auto-onderhoud, auto-problemen of autopart-context:
  kies GENERAL
- Als iemand een onderdeelnummer / part number noemt, is dat meestal SEARCH
- Als iemand wil kopen / apart houden / reserveren / ophalen, is dat RESERVATION
- Als het gewoon begroeting of casual praat is, is dat SMALLTALK

Output format:
{
  "intent": "SEARCH" | "RESERVATION" | "GENERAL" | "SMALLTALK",
  "confidence": 0.0
}
`.trim();

  const history = (body.history || [])
    .slice(-6)
    .map((m) => `${m.sender === "user" ? "User" : "Assistant"}: ${m.text}`)
    .join("\n");

  const user = `
User message:
${(body.message || "").trim()}

Recent history:
${history || "(none)"}
`.trim();

  return [
    { role: "system" as const, content: `${system}\n\n${developer}` },
    { role: "user" as const, content: user },
  ];
}

export async function detectIntent(body: ChatRequestBody): Promise<IntentResult> {
  const apiKey = (process.env.GROQ_API_KEY || "").trim();
  const modelName = (process.env.GROQ_MODEL || "llama-3.3-70b-versatile").trim();

  if (!apiKey) {
    return { intent: "GENERAL", confidence: 0.3 };
  }

  try {
    const client = new Groq({ apiKey });

    const completion = await client.chat.completions.create({
      model: modelName,
      temperature: 0.1,
      messages: buildIntentPrompt(body),
      response_format: { type: "json_object" },
    });

    const text = completion.choices?.[0]?.message?.content?.trim() || "{}";
    const parsed = DecisionSchema.parse(JSON.parse(text));

    return {
      intent: parsed.intent as IntentName,
      confidence: parsed.confidence,
    };
  } catch (err) {
    console.error("detectIntent Groq error:", err);
    return { intent: "GENERAL", confidence: 0.4 };
  }
}