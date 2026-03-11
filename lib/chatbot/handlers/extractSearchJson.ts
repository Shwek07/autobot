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

export async function extractSearchJson(message: string): Promise<SearchExtractResult> {
  const apiKey = (process.env.GROQ_API_KEY || "").trim();
  const modelName = (process.env.GROQ_MODEL || "llama-3.3-70b-versatile").trim();

  if (!apiKey) {
    throw new Error("GROQ_API_KEY ontbreekt");
  }

  const client = new Groq({ apiKey });

  const prompt = `
Je bent een JSON data extractor voor een autopart chatbot.

Jouw taak:
Haal uit de input van de gebruiker alleen de relevante zoekvelden.

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
- Als iets niet in de input staat, laat het leeg als ""
- Gebruik altijd strings
- part = naam van het onderdeel
- partNumber = onderdeelnummer / OEM nummer / product code
- brand = automerk
- model = automodel
- year = bouwjaar als string

Gebruiker input:
${message}
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

  const parsed = SearchExtractSchema.parse(JSON.parse(content));
  return parsed;
}