// lib/chatbot/extractSearchJson.ts

import Groq from "groq-sdk";
import { z } from "zod";

const SearchExtractSchema = z.object({
  part: z.string(),
  partNumber: z.string(),
  brand: z.string(),
  model: z.string(),
  year: z.union([z.string(), z.number()]).transform((v) => String(v)),
});

export type SearchExtractResult = z.infer<typeof SearchExtractSchema>;

interface SearchStateLike {
  part?: string;
  partNumber?: string;
  brand?: string;
  model?: string;
  year?: string;
}

interface ExtractSearchJsonParams {
  message: string;
  currentSearchState?: SearchStateLike;
}

export async function extractSearchJson(
  params: string | ExtractSearchJsonParams
): Promise<SearchExtractResult> {
  const apiKey = (process.env.GROQ_API_KEY || "").trim();
  const modelName = (process.env.GROQ_MODEL || "llama-3.3-70b-versatile").trim();

  if (!apiKey) {
    throw new Error("GROQ_API_KEY ontbreekt");
  }

  const normalized =
    typeof params === "string"
      ? { message: params, currentSearchState: {} }
      : {
          message: params.message || "",
          currentSearchState: params.currentSearchState || {},
        };

  const client = new Groq({ apiKey });

  const prompt = `
Je bent een JSON data extractor voor een autopart chatbot.

Doel:
Haal uit de NIEUWE user input alleen de relevante zoekvelden.
Gebruik de huidige search state als context om korte antwoorden beter te begrijpen.

Geef ALLEEN geldige JSON terug.
Geen uitleg.
Geen markdown.
Geen code block.

Gebruik exact dit JSON formaat:
{
  "part": "",
  "partNumber": "",
  "brand": "",
  "model": "",
  "year": ""
}

Regels:
- Vul alleen in wat je met redelijke zekerheid uit de NIEUWE user input kunt halen
- Als iets niet uit de nieuwe input blijkt, laat het ""
- Gebruik context alleen om korte antwoorden te interpreteren
- Gebruik context NIET om oude waarden opnieuw te kopiëren
- Gebruik altijd strings
- part = naam van het onderdeel
- partNumber = onderdeelnummer / OEM nummer / product code
- brand = automerk
- model = automodel
- year = bouwjaar als string
- Als user alleen "2012" zegt, dan year = "2012"
- Als user alleen "Hilux" zegt, dan model = "Hilux"
- Als user alleen "Toyota" zegt, dan brand = "Toyota"
- Als user alleen een onderdeel noemt zoals "sparkplug", dan part = "sparkplug"

HUIDIGE SEARCH STATE:
${JSON.stringify(normalized.currentSearchState, null, 2)}

NIEUWE USER INPUT:
${normalized.message}
`.trim();

  const completion = await client.chat.completions.create({
    model: modelName,
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = completion.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error("Geen content ontvangen van Groq");
  }

  return SearchExtractSchema.parse(JSON.parse(content));
}