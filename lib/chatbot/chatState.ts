import type { ChatSummaryState } from "./types";

export function createEmptyChatSummaryState(): ChatSummaryState {
  return {
    intent: "",
    searchState: {
      part: "",
      partNumber: "",
      brand: "",
      model: "",
      year: "",
      missingFields: [],
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

export function parseChatSummary(summary?: string): ChatSummaryState {
  if (!summary?.trim()) return createEmptyChatSummaryState();

  try {
    const parsed = JSON.parse(summary);
    return {
      ...createEmptyChatSummaryState(),
      ...parsed,
      searchState: {
        ...createEmptyChatSummaryState().searchState,
        ...(parsed.searchState || {}),
      },
      reservationState: {
        ...createEmptyChatSummaryState().reservationState,
        ...(parsed.reservationState || {}),
      },
      notes: Array.isArray(parsed.notes) ? parsed.notes : [],
      openQuestion: typeof parsed.openQuestion === "string" ? parsed.openQuestion : "",
    };
  } catch {
    return createEmptyChatSummaryState();
  }
}