import Groq from "groq-sdk";
import { z } from "zod";

const RequiredFieldSchema = z.enum([
  "part",
  "brand",
  "autoBrand",
  "model",
  "year",
]);

const LastAskedFieldSchema = z.union([RequiredFieldSchema, z.literal("")]);

export type RequiredSearchField = z.infer<typeof RequiredFieldSchema>;

const SearchCollectorSchema = z.object({
  extracted: z.object({
    part: z.string(),
    brand: z.string(),
    autoBrand: z.string(),
    model: z.string(),
    year: z.string(),
  }),
  updatedSearchState: z.object({
    part: z.string(),
    brand: z.string(),
    autoBrand: z.string(),
    model: z.string(),
    year: z.string(),
    missingFields: z.array(RequiredFieldSchema),
    readyForDbSearch: z.boolean(),
    lastAskedField: LastAskedFieldSchema,
  }),
  assistantReply: z.string(),
  nextQuestion: z.string(),
  suggestions: z.array(z.string()).max(3),
  notes: z.array(z.string()).optional(),
});

export type SearchCollectorResult = z.infer<typeof SearchCollectorSchema>;

interface SearchStateLike {
  part?: string;
  brand?: string;
  autoBrand?: string;
  model?: string;
  year?: string;
  missingFields?: RequiredSearchField[];
  readyForDbSearch?: boolean;
  lastAskedField?: RequiredSearchField | "";
}

interface SearchSummaryLike {
  intent?: string;
  searchState?: SearchStateLike;
  reservationState?: {
    part?: string;
    quantity?: string;
    pickupDate?: string;
  };
  notes?: string[];
  openQuestion?: string;
}

interface CollectSearchStateParams {
  message: string;
  currentSummary?: SearchSummaryLike;
}

function cleanString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function extractYearFromMessage(message: string): string {
  const text = cleanString(message);
  const match = text.match(/\b(19\d{2}|20\d{2}|2100)\b/);
  return match ? match[1] : "";
}

function uniqueStrings(items?: string[]): string[] {
  if (!Array.isArray(items)) return [];
  return [...new Set(items.map((item) => cleanString(item)).filter(Boolean))];
}

function computeMissingFields(state: {
  part: string;
  brand: string;
  autoBrand: string;
  model: string;
  year: string;
}): RequiredSearchField[] {
  const missing: RequiredSearchField[] = [];

  if (!state.part) missing.push("part");
  if (!state.brand) missing.push("brand");
  if (!state.autoBrand) missing.push("autoBrand");
  if (!state.model) missing.push("model");
  if (!state.year) missing.push("year");

  return missing;
}

export async function collectSearchState({
  message,
  currentSummary,
}: CollectSearchStateParams): Promise<SearchCollectorResult> {
  const apiKey = (process.env.GROQ_API_KEY || "").trim();
  const modelName = (process.env.GROQ_MODEL || "llama-3.3-70b-versatile").trim();

  if (!apiKey) {
    throw new Error("GROQ_API_KEY ontbreekt");
  }

  const client = new Groq({ apiKey });

  const prompt = `
Je bent een JSON search intake controller voor een autopart chatbot.

De chatbot verzamelt ALLEEN deze velden in de summary:
- part
- brand
- autoBrand
- model
- year

De database bevat onder andere informatie uit:
- Categories
- Products
- Auto_model
- Product_compatibility

Maar voor de intake mag je ALLEEN bovenstaande 5 velden verzamelen.

Betekenis van de velden:
- part = het onderdeel dat de gebruiker zoekt
- brand = merk van het onderdeel / productmerk indien genoemd
- autoBrand = automerk
- model = automodel
- year = bouwjaar

Jouw taak:
- Begrijp de NIEUWE user input
- Gebruik de huidige summary/searchState als context
- Update de searchState slim over meerdere turns
- Bewaar bestaande info als die nog geldig is
- Overschrijf alleen als de gebruiker duidelijk corrigeert
- Stel precies 1 logische vervolgvraag als er nog velden ontbreken
- De vraag moet natuurlijk klinken in het Nederlands
- De vervolgvraag mag NIET hardcoded zijn
- Gebruik de context om te bepalen wat het beste volgende veld is
- Als de gebruiker een los jaartal stuurt zoals "2013", sla dat op als year als het logisch past
- Zodra alle 5 velden compleet zijn, stel GEEN vraag meer

Belangrijke regels:
- extracted mag alleen bevatten wat uit de NIEUWE user input komt
- updatedSearchState moet de volledige geüpdatete state bevatten
- readyForDbSearch = true alleen als part, brand, autoBrand, model en year gevuld zijn
- missingFields moet exact zijn
- lastAskedField moet het eerstvolgende ontbrekende veld zijn, of "" als alles compleet is
- nextQuestion moet leeg zijn als alles compleet is
- assistantReply moet kort en natuurlijk zijn
- Geef ALLEEN geldige JSON terug
- Geen markdown
- Geen uitleg
- Geen code block

Gebruik exact dit JSON formaat:
{
  "extracted": {
    "part": "",
    "brand": "",
    "autoBrand": "",
    "model": "",
    "year": ""
  },
  "updatedSearchState": {
    "part": "",
    "brand": "",
    "autoBrand": "",
    "model": "",
    "year": "",
    "missingFields": ["part"],
    "readyForDbSearch": false,
    "lastAskedField": "part"
  },
  "assistantReply": "",
  "nextQuestion": "",
  "suggestions": ["", "", ""],
  "notes": []
}

HUIDIGE SUMMARY:
${JSON.stringify(currentSummary ?? {}, null, 2)}

NIEUWE USER INPUT:
${message}
  `.trim();

  const completion = await client.chat.completions.create({
    model: modelName,
    temperature: 0.2,
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

  const parsed = SearchCollectorSchema.parse(JSON.parse(content));

  const current = currentSummary?.searchState ?? {};
  const fallbackYear = extractYearFromMessage(message);

  const mergedState = {
    part: cleanString(parsed.updatedSearchState.part) || cleanString(current.part),
    brand: cleanString(parsed.updatedSearchState.brand) || cleanString(current.brand),
    autoBrand:
      cleanString(parsed.updatedSearchState.autoBrand) || cleanString(current.autoBrand),
    model: cleanString(parsed.updatedSearchState.model) || cleanString(current.model),
    year:
      cleanString(parsed.updatedSearchState.year) ||
      fallbackYear ||
      cleanString(current.year),
    missingFields: [] as RequiredSearchField[],
    readyForDbSearch: false,
    lastAskedField: "" as RequiredSearchField | "",
  };

  const missingFields = computeMissingFields({
    part: mergedState.part,
    brand: mergedState.brand,
    autoBrand: mergedState.autoBrand,
    model: mergedState.model,
    year: mergedState.year,
  });

  mergedState.missingFields = missingFields;
  mergedState.readyForDbSearch = missingFields.length === 0;
  mergedState.lastAskedField = missingFields[0] || "";

  return {
    ...parsed,
    extracted: {
      part: cleanString(parsed.extracted.part),
      brand: cleanString(parsed.extracted.brand),
      autoBrand: cleanString(parsed.extracted.autoBrand),
      model: cleanString(parsed.extracted.model),
      year: cleanString(parsed.extracted.year) || fallbackYear,
    },
    updatedSearchState: mergedState,
    notes: uniqueStrings(parsed.notes),
  };
}