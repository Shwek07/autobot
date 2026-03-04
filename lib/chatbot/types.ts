// lib/chatbot/types.ts
export type Sender = "user" | "bot";

export interface ChatHistoryItem {
  sender: Sender;
  text: string;
}

export interface ChatRequestBody {
  message?: string;
  conversationId?: string | null;
  history?: ChatHistoryItem[];
}

export type IntentName = "SEARCH" | "RESERVATION" | "GENERAL" | "SMALLTALK";

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