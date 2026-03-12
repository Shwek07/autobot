export type UiSender = "user" | "bot";
export type ChatHistorySender = "user" | "assistant";

export type IntentName = "SEARCH" | "RESERVATION" | "GENERAL";

export type RequiredSearchField =
  | "part"
  | "brand"
  | "autoBrand"
  | "model"
  | "year";

export interface ChatHistoryItem {
  sender: ChatHistorySender;
  text: string;
}

export interface SearchState {
  part: string;
  brand: string;
  autoBrand: string;
  model: string;
  year: string;
  missingFields: RequiredSearchField[];
  readyForDbSearch: boolean;
  lastAskedField?: RequiredSearchField | "";
}

export interface SearchResultItem {
  productId: number;
  productName: string;
  productBrand: string;
  categoryName: string;
  partNumber: string;
  sku: string;
  salePrice: number | null;
  stockQuantity: number | null;
  autoBrand: string;
  autoModel: string;
  year: number | null;
  compatibilityId: number | null;
}

export interface SearchResultsState {
  hasSearched: boolean;
  totalFound: number;
  items: SearchResultItem[];
  lastQueryText: string;
}

export interface ReservationState {
  part: string;
  quantity: string;
  pickupDate: string;
  selectedProductId?: number | null;
  selectedProductName?: string;
  status?: string;
  reservationId?: number | null;
  expiresAt?: string;
  lastAction?: "created" | "failed" | "";
}

export interface ChatSummaryState {
  intent: IntentName | "";
  searchState: SearchState;
  searchResults: SearchResultsState;
  reservationState: ReservationState;
  notes: string[];
  openQuestion: string;
}

export interface ChatRequestBody {
  message: string;
  history?: ChatHistoryItem[];
  chatSummary?: string;
  localChatId?: number;
}

export interface ChatResponseBody {
  message: string;
  intent?: IntentName;
  suggestions?: string[];
  summary?: string;
}

export interface IntentResult {
  intent: IntentName;
  confidence: number;
  entities?: Record<string, any>;
}