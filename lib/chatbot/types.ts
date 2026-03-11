export type UiSender = "user" | "bot";
export type ChatHistorySender = "user" | "assistant";

export type IntentName = "SEARCH" | "RESERVATION" | "GENERAL" | "SMALLTALK";

export interface ChatHistoryItem {
  sender: ChatHistorySender;
  text: string;
}

export interface SearchState {
  part: string;
  partNumber: string;
  brand: string;
  model: string;
  year: string;
  missingFields: string[];
  readyForDbSearch: boolean;
  lastAskedField?: string;
}

export interface ReservationState {
  part: string;
  quantity: string;
  pickupDate: string;
}

export interface ChatSummaryState {
  intent: IntentName | "";
  searchState: SearchState;
  reservationState: ReservationState;
  notes: string[];
  openQuestion: string;
}

export interface ChatRequestBody {
  message: string;
  conversationId?: string;
  localChatId?: string | number;
  history?: ChatHistoryItem[];
  chatSummary?: string;
}

export interface ChatResponseBody {
  message: string;
  suggestions?: string[];
  sessionId?: string;
  intent?: IntentName;
}

export interface IntentResult {
  intent: IntentName;
  confidence: number;
  entities?: Record<string, any>;
}

export interface ChatHistoryItem {
  sender: ChatHistorySender;
  text: string;
}