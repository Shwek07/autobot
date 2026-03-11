// lib/chatbot/handlers/search.ts

import type { ChatRequestBody, ChatResponseBody } from "../types";
import { extractSearchJson } from "./extractSearchJson";

type RequiredSearchField = "part" | "model" | "year";

interface SearchSummaryState {
  intent: "SEARCH" | "RESERVATION" | "GENERAL" | "SMALLTALK" | "";
  searchState: {
    part: string;
    partNumber: string;
    brand: string;
    model: string;
    year: string;
    missingFields: RequiredSearchField[];
    readyForDbSearch: boolean;
    lastAskedField: RequiredSearchField | "";
  };
  reservationState: {
    part: string;
    quantity: string;
    pickupDate: string;
  };
  notes: string[];
  openQuestion: string;
}

function createEmptySummary(): SearchSummaryState {
  return {
    intent: "",
    searchState: {
      part: "",
      partNumber: "",
      brand: "",
      model: "",
      year: "",
      missingFields: ["part", "model", "year"],
      readyForDbSearch: false,
      lastAskedField: "",
    },
    reservationState: {
      part: "",
      quantity: "",
      pickupDate: "",
    },
    notes: [],
    openQuestion: "",
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeRequiredField(value: string): RequiredSearchField | "" {
  if (value === "part" || value === "model" || value === "year") return value;
  return "";
}

function parseSummary(summary?: string): SearchSummaryState {
  if (!summary?.trim()) {
    return createEmptySummary();
  }

  try {
    const parsed = JSON.parse(summary);

    if (!isObject(parsed)) {
      return createEmptySummary();
    }

    const base = createEmptySummary();
    const searchStateRaw = isObject(parsed.searchState) ? parsed.searchState : {};
    const reservationStateRaw = isObject(parsed.reservationState)
      ? parsed.reservationState
      : {};

    const merged: SearchSummaryState = {
      intent:
        parsed.intent === "SEARCH" ||
        parsed.intent === "RESERVATION" ||
        parsed.intent === "GENERAL" ||
        parsed.intent === "SMALLTALK"
          ? parsed.intent
          : "",
      searchState: {
        part: asString(searchStateRaw.part),
        partNumber: asString(searchStateRaw.partNumber),
        brand: asString(searchStateRaw.brand),
        model: asString(searchStateRaw.model),
        year: asString(searchStateRaw.year),
        missingFields: Array.isArray(searchStateRaw.missingFields)
          ? searchStateRaw.missingFields.filter(
              (field): field is RequiredSearchField =>
                field === "part" || field === "model" || field === "year"
            )
          : base.searchState.missingFields,
        readyForDbSearch:
          typeof searchStateRaw.readyForDbSearch === "boolean"
            ? searchStateRaw.readyForDbSearch
            : base.searchState.readyForDbSearch,
        lastAskedField: normalizeRequiredField(asString(searchStateRaw.lastAskedField)),
      },
      reservationState: {
        part: asString(reservationStateRaw.part),
        quantity: asString(reservationStateRaw.quantity),
        pickupDate: asString(reservationStateRaw.pickupDate),
      },
      notes: Array.isArray(parsed.notes)
        ? parsed.notes.filter((item): item is string => typeof item === "string")
        : [],
      openQuestion: asString(parsed.openQuestion),
    };

    return recalculateSearchState(merged);
  } catch {
    return createEmptySummary();
  }
}

function recalculateSearchState(summary: SearchSummaryState): SearchSummaryState {
  const missingFields: RequiredSearchField[] = [];

  if (!summary.searchState.part) missingFields.push("part");
  if (!summary.searchState.model) missingFields.push("model");
  if (!summary.searchState.year) missingFields.push("year");

  let openQuestion = "";
  let lastAskedField: RequiredSearchField | "" = "";

  if (missingFields.length > 0) {
    const nextField = missingFields[0];
    lastAskedField = nextField;

    if (nextField === "part") {
      openQuestion = "Welk onderdeel zoek je precies?";
    } else if (nextField === "model") {
      openQuestion = "Voor welk automodel is het onderdeel?";
    } else if (nextField === "year") {
      openQuestion = "Van welk bouwjaar is de auto?";
    }
  }

  return {
    ...summary,
    intent: "SEARCH",
    searchState: {
      ...summary.searchState,
      missingFields,
      readyForDbSearch: missingFields.length === 0,
      lastAskedField,
    },
    openQuestion,
  };
}

function mergeSearchState(
  current: SearchSummaryState,
  incoming: {
    part?: string;
    partNumber?: string;
    brand?: string;
    model?: string;
    year?: string;
  }
): SearchSummaryState {
  const next: SearchSummaryState = {
    ...current,
    intent: "SEARCH",
    searchState: {
      ...current.searchState,
      part: incoming.part?.trim() ? incoming.part.trim() : current.searchState.part,
      partNumber: incoming.partNumber?.trim()
        ? incoming.partNumber.trim()
        : current.searchState.partNumber,
      brand: incoming.brand?.trim() ? incoming.brand.trim() : current.searchState.brand,
      model: incoming.model?.trim() ? incoming.model.trim() : current.searchState.model,
      year: incoming.year?.trim() ? incoming.year.trim() : current.searchState.year,
      missingFields: current.searchState.missingFields,
      readyForDbSearch: current.searchState.readyForDbSearch,
      lastAskedField: current.searchState.lastAskedField,
    },
  };

  return recalculateSearchState(next);
}

function buildSuggestions(summary: SearchSummaryState): string[] {
  const missing = summary.searchState.missingFields;

  if (missing.includes("part")) {
    return ["spark plug", "remblokken", "waterpomp"];
  }

  if (missing.includes("model")) {
    return ["Hilux", "Corolla", "Vitz"];
  }

  if (missing.includes("year")) {
    return ["2012", "2015", "2020"];
  }

  return ["Zoek verder", "Check voorraad", "Check compatibiliteit"];
}

export async function handleSearch(body: ChatRequestBody): Promise<ChatResponseBody> {
  try {
    const currentSummary = parseSummary(body.chatSummary);

    const extracted = await extractSearchJson({
      message: body.message || "",
      currentSearchState: currentSummary.searchState,
    });

    const updatedSummary = mergeSearchState(currentSummary, extracted);

    return {
      message: JSON.stringify(
        {
          status: "Ik ben het aan het checken.",
          intent: "SEARCH",
          flow: "COLLECT_SEARCH_INFO",
          extractedFromCurrentMessage: extracted,
          collected: {
            part: updatedSummary.searchState.part,
            partNumber: updatedSummary.searchState.partNumber,
            brand: updatedSummary.searchState.brand,
            model: updatedSummary.searchState.model,
            year: updatedSummary.searchState.year,
          },
          missingFields: updatedSummary.searchState.missingFields,
          readyForDbSearch: updatedSummary.searchState.readyForDbSearch,
          nextQuestion: updatedSummary.openQuestion,
          summary: updatedSummary,
        },
        null,
        2
      ),
      intent: "SEARCH",
      suggestions: buildSuggestions(updatedSummary),
    };
  } catch (error) {
    console.error("handleSearch extraction error:", error);

    const fallbackSummary = recalculateSearchState(parseSummary(body.chatSummary));

    return {
      message: JSON.stringify(
        {
          status: "Ik ben het aan het checken.",
          intent: "SEARCH",
          flow: "COLLECT_SEARCH_INFO",
          extractedFromCurrentMessage: {
            part: "",
            partNumber: "",
            brand: "",
            model: "",
            year: "",
          },
          collected: {
            part: fallbackSummary.searchState.part,
            partNumber: fallbackSummary.searchState.partNumber,
            brand: fallbackSummary.searchState.brand,
            model: fallbackSummary.searchState.model,
            year: fallbackSummary.searchState.year,
          },
          missingFields: fallbackSummary.searchState.missingFields,
          readyForDbSearch: fallbackSummary.searchState.readyForDbSearch,
          nextQuestion:
            fallbackSummary.openQuestion ||
            "Ik heb nog meer info nodig: automodel, bouwjaar en onderdeel.",
          summary: fallbackSummary,
          error: "Extractie mislukt",
        },
        null,
        2
      ),
      intent: "SEARCH",
      suggestions: buildSuggestions(fallbackSummary),
    };
  }
}