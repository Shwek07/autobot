export type UiSender = "user" | "bot";
export type ChatHistorySender = "user" | "assistant";

export type IntentName = "SEARCH" | "RESERVATION" | "GENERAL" | "SMALLTALK";

export interface ChatHistoryItem {
  sender: ChatHistorySender;
  text: string;
}

export interface ChatRequestBody {
  message: string;
  conversationId?: string;
  localChatId?: string | number;
  history?: ChatHistoryItem[];
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