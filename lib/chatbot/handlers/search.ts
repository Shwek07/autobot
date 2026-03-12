import Groq from "groq-sdk";
import type {
  ChatRequestBody,
  ChatResponseBody,
  ChatSummaryState,
  SearchResultItem,
} from "../types";
import { collectSearchState } from "../collectSearchState";
import { createEmptyChatSummaryState, parseChatSummary } from "../chatState";
import { searchProductsForVehicle } from "../searchDb";

function buildSearchQueryText(summary: ChatSummaryState): string {
  const s = summary.searchState;
  return `${s.part} | ${s.brand} | ${s.autoBrand} | ${s.model} | ${s.year}`.trim();
}

function buildFallbackSearchMessage(items: SearchResultItem[], summary: ChatSummaryState): string {
  const s = summary.searchState;

  if (!items.length) {
    return `Ik heb geen resultaten gevonden voor ${s.part} van ${s.brand} voor een ${s.autoBrand} ${s.model} ${s.year}.`;
  }

  const preview = items
    .slice(0, 3)
    .map((item) => {
      const stockText =
        item.stockQuantity != null ? `voorraad: ${item.stockQuantity}` : "voorraad onbekend";
      const priceText =
        item.salePrice != null ? `prijs: ${item.salePrice}` : "prijs onbekend";

      return `${item.productName} (${item.productBrand}) - ${stockText}, ${priceText}`;
    })
    .join("; ");

  return `Ik heb ${items.length} resultaat${items.length === 1 ? "" : "en"} gevonden voor ${s.part} van ${s.brand} voor een ${s.autoBrand} ${s.model} ${s.year}. ${preview}`;
}

async function generateUserSearchReply(
  summary: ChatSummaryState,
  items: SearchResultItem[]
): Promise<string> {
  const apiKey = (process.env.GROQ_API_KEY || "").trim();
  const modelName = (process.env.GROQ_MODEL || "llama-3.3-70b-versatile").trim();

  if (!apiKey) {
    return buildFallbackSearchMessage(items, summary);
  }

  try {
    const client = new Groq({ apiKey });

    const prompt = `
Je bent AutoBot, een behulpzame chatbot voor een auto-onderdelenwinkel.

Je krijgt:
1. de zoekinput
2. echte database-resultaten

Jouw taak:
- schrijf een korte, duidelijke Nederlandse reactie voor de gebruiker
- als er resultaten zijn:
  - zeg dat je iets hebt gevonden
  - noem maximaal 3 producten kort
  - noem merk, eventueel part number, prijs en voorraad als beschikbaar
  - verzin geen info die er niet is
- als er geen resultaten zijn:
  - zeg dat er niets is gevonden
  - blijf kort en duidelijk
- geen markdown tabel
- geen JSON
- natuurlijke winkel-assistent stijl

ZOEKINPUT:
${JSON.stringify(summary.searchState, null, 2)}

DATABASE RESULTATEN:
${JSON.stringify(items, null, 2)}

Geef alleen de reactie voor de gebruiker terug.
    `.trim();

    const completion = await client.chat.completions.create({
      model: modelName,
      temperature: 0.3,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = completion.choices?.[0]?.message?.content?.trim();

    if (!content) {
      return buildFallbackSearchMessage(items, summary);
    }

    return content;
  } catch (error) {
    console.error("generateUserSearchReply error:", error);
    return buildFallbackSearchMessage(items, summary);
  }
}

export async function handleSearch(body: ChatRequestBody): Promise<ChatResponseBody> {
  try {
    const currentSummary = parseChatSummary(body.chatSummary);

    const intakeResult = await collectSearchState({
      message: body.message || "",
      currentSummary,
    });

    const updatedSummary: ChatSummaryState = {
      ...currentSummary,
      intent: "SEARCH",
      searchState: {
        part: intakeResult.updatedSearchState.part,
        brand: intakeResult.updatedSearchState.brand,
        autoBrand: intakeResult.updatedSearchState.autoBrand,
        model: intakeResult.updatedSearchState.model,
        year: intakeResult.updatedSearchState.year,
        missingFields: intakeResult.updatedSearchState.missingFields,
        readyForDbSearch: intakeResult.updatedSearchState.readyForDbSearch,
        lastAskedField: intakeResult.updatedSearchState.lastAskedField,
      },
      searchResults: currentSummary.searchResults || createEmptyChatSummaryState().searchResults,
      notes: intakeResult.notes || currentSummary.notes || [],
      openQuestion: intakeResult.nextQuestion,
    };

    if (!updatedSummary.searchState.readyForDbSearch) {
      return {
        message: intakeResult.assistantReply,
        intent: "SEARCH",
        suggestions:
          intakeResult.suggestions?.length > 0
            ? intakeResult.suggestions.filter(Boolean)
            : [],
        summary: JSON.stringify(updatedSummary, null, 2),
      };
    }

    const dbResult = await searchProductsForVehicle(updatedSummary.searchState);

    updatedSummary.searchResults = {
      hasSearched: true,
      totalFound: dbResult.totalFound,
      items: dbResult.items,
      lastQueryText: buildSearchQueryText(updatedSummary),
    };

    updatedSummary.openQuestion = "";

    if (dbResult.totalFound === 0) {
      updatedSummary.notes = [
        ...(updatedSummary.notes || []),
        "Laatste zoekopdracht gaf geen resultaten in de database.",
      ];
    }

    const userReply = await generateUserSearchReply(updatedSummary, dbResult.items);

    return {
      message: userReply,
      intent: "SEARCH",
      suggestions:
        dbResult.totalFound > 0
          ? dbResult.items.slice(0, 3).map((item) => item.productName)
          : [],
      summary: JSON.stringify(updatedSummary, null, 2),
    };
  } catch (error) {
    console.error("handleSearch error:", error);

    const fallbackSummary = parseChatSummary(body.chatSummary);

    return {
      message:
        "Er ging iets mis tijdens het zoeken in de database. Probeer het opnieuw.",
      intent: "SEARCH",
      suggestions: [],
      summary: JSON.stringify(fallbackSummary, null, 2),
    };
  }
}