// lib/chatbot/intent.ts

import type { ChatRequestBody, IntentResult, IntentName } from "./types";
import Groq from "groq-sdk";
import { z } from "zod";

const DecisionSchema = z.object({
  intent: z.enum(["SEARCH", "RESERVATION", "GENERAL", "SMALLTALK"]),
  confidence: z.number().min(0).max(1),
});

const INTENT_CONFIG = {
  role: "intent-classifier",
  app: "AutoBot",
  version: 2,
  instructions: [
    "Bepaal ALLEEN de intent van de gebruiker.",
    "Antwoord ALLEEN met geldige JSON.",
    "Gebruik exact het output schema.",
    "Gebruik de user message als hoofdbron.",
    "Gebruik chat summary en recente history alleen als context bij korte of onduidelijke berichten.",
  ],
  intents: {
    SEARCH: {
      description:
        "Gebruiker zoekt een auto-onderdeel, compatibiliteit, voorraad, prijs of beschikbaarheid.",
      examples: [
        "Heb je spark plugs voor Hilux?",
        "Ik zoek remblokken voor Toyota Vitz 2012",
        "Hebben jullie waterpomp?",
        "Ik heb part number 04465-0D140",
        "Past dit onderdeel op een Nissan March?",
        "Hebben jullie dat op voorraad?",
      ],
      detection_rules: [
        "Onderdeelnaam, onderdeelnummer, part number, voorraad, prijs, beschikbaarheid of compatibiliteit wijst meestal op SEARCH.",
        "Ook vage zoekvragen vallen onder SEARCH.",
        "Als de gebruiker verder antwoord geeft op een eerdere zoekvraag, blijft dat SEARCH.",
      ],
    },
    RESERVATION: {
      description:
        "Gebruiker wil reserveren, laten klaarleggen, bestellen of ophalen.",
      examples: [
        "Kan je 2 remblokken voor mij apart houden?",
        "Ik wil dit onderdeel reserveren",
        "Leg deze accu voor me klaar",
        "Ik kom het morgen ophalen",
      ],
      detection_rules: [
        "Woorden zoals reserveren, klaarleggen, apart houden, bestellen, ophalen wijzen op RESERVATION.",
      ],
    },
    GENERAL: {
      description:
        "Algemene auto-vragen, auto-onderhoud, auto-problemen of advies, zonder directe zoek- of reserveringsactie.",
      examples: [
        "Mijn auto trilt bij het remmen, wat kan het zijn?",
        "Wanneer moet ik mijn olie vervangen?",
        "Wat doet een distributieriem?",
      ],
      detection_rules: [
        "Als het geen product search, reservering of smalltalk is, kies GENERAL.",
        "Alles buiten autopart-context mag ook GENERAL worden.",
      ],
    },
    SMALLTALK: {
      description: "Begroetingen, bedankjes en casual praat.",
      examples: ["Hallo", "Hoe gaat het?", "Dankjewel", "Top"],
      detection_rules: [
        "Korte sociale berichten zonder inhoudelijke autopart-vraag zijn SMALLTALK.",
      ],
    },
  },
  priority_rules: [
    "Als iemand wil kopen / apart houden / reserveren / ophalen, kies RESERVATION boven SEARCH.",
    "Als iemand een onderdeel of onderdeelnummer noemt zonder reserveringsactie, kies SEARCH.",
    "Korte vervolgreplies zoals een bouwjaar, model of merk blijven SEARCH als de summary/history laat zien dat er al een zoekflow bezig is.",
    "Als iets duidelijk smalltalk is, kies SMALLTALK.",
  ],
  output_schema: {
    intent: "SEARCH | RESERVATION | GENERAL | SMALLTALK",
    confidence: "number between 0 and 1",
  },
} as const;

function buildIntentPrompt(body: ChatRequestBody) {
  const system = `
Je bent een intent-classifier voor een autopart shop chatbot.
Werk strikt volgens deze JSON configuratie.
Geef ALLEEN geldige JSON terug, zonder uitleg.

CONFIG:
${JSON.stringify(INTENT_CONFIG, null, 2)}
`.trim();

  const history = (body.history || [])
    .slice(-6)
    .map((m) => `${m.sender === "user" ? "User" : "Assistant"}: ${m.text}`)
    .join("\n");

  const user = `
User message:
${(body.message || "").trim()}

Chat summary:
${body.chatSummary || "(none)"}

Recent history:
${history || "(none)"}

Geef nu alleen JSON terug in exact dit formaat:
{
  "intent": "SEARCH",
  "confidence": 0.0
}
`.trim();

  return [
    { role: "system" as const, content: system },
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
      temperature: 0,
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