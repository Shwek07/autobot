import type {
  ChatSummaryState,
  RequiredSearchField,
  SearchResultItem,
} from "./types";

function getMissingFields(searchState: {
  part: string;
  brand: string;
  autoBrand: string;
  model: string;
  year: string;
}): RequiredSearchField[] {
  const missing: RequiredSearchField[] = [];

  if (!searchState.part.trim()) missing.push("part");
  if (!searchState.brand.trim()) missing.push("brand");
  if (!searchState.autoBrand.trim()) missing.push("autoBrand");
  if (!searchState.model.trim()) missing.push("model");
  if (!searchState.year.trim()) missing.push("year");

  return missing;
}

function normalizeSearchItems(items: unknown): SearchResultItem[] {
  if (!Array.isArray(items)) return [];

  return items
    .map((item) => {
      if (typeof item !== "object" || item === null) return null;
      const row = item as Record<string, unknown>;

      return {
        productId: Number(row.productId ?? 0),
        productName: typeof row.productName === "string" ? row.productName.trim() : "",
        productBrand: typeof row.productBrand === "string" ? row.productBrand.trim() : "",
        categoryName: typeof row.categoryName === "string" ? row.categoryName.trim() : "",
        partNumber: typeof row.partNumber === "string" ? row.partNumber.trim() : "",
        sku: typeof row.sku === "string" ? row.sku.trim() : "",
        salePrice:
          typeof row.salePrice === "number"
            ? row.salePrice
            : row.salePrice != null
            ? Number(row.salePrice)
            : null,
        stockQuantity:
          typeof row.stockQuantity === "number"
            ? row.stockQuantity
            : row.stockQuantity != null
            ? Number(row.stockQuantity)
            : null,
        autoBrand: typeof row.autoBrand === "string" ? row.autoBrand.trim() : "",
        autoModel: typeof row.autoModel === "string" ? row.autoModel.trim() : "",
        year:
          typeof row.year === "number"
            ? row.year
            : row.year != null
            ? Number(row.year)
            : null,
        compatibilityId:
          typeof row.compatibilityId === "number"
            ? row.compatibilityId
            : row.compatibilityId != null
            ? Number(row.compatibilityId)
            : null,
      };
    })
    .filter((item): item is SearchResultItem => Boolean(item && item.productId));
}

export function createEmptyChatSummaryState(): ChatSummaryState {
  const searchState = {
    part: "",
    brand: "",
    autoBrand: "",
    model: "",
    year: "",
    missingFields: [] as RequiredSearchField[],
    readyForDbSearch: false,
    lastAskedField: "" as RequiredSearchField | "",
  };

  const missingFields = getMissingFields(searchState);

  return {
    intent: "",
    searchState: {
      ...searchState,
      missingFields,
      readyForDbSearch: missingFields.length === 0,
      lastAskedField: missingFields[0] || "",
    },
    searchResults: {
      hasSearched: false,
      totalFound: 0,
      items: [],
      lastQueryText: "",
    },
    reservationState: {
      part: "",
      quantity: "",
      pickupDate: "",
      selectedProductId: null,
      selectedProductName: "",
      status: "",
      reservationId: null,
      expiresAt: "",
      lastAction: "",
    },
    notes: [],
    openQuestion: "",
  };
}

export function parseChatSummary(summary?: string): ChatSummaryState {
  if (!summary?.trim()) return createEmptyChatSummaryState();

  try {
    const parsed = JSON.parse(summary);
    const base = createEmptyChatSummaryState();

    const mergedSearchState = {
      ...base.searchState,
      ...(parsed.searchState || {}),
    };

    const missingFields = getMissingFields(mergedSearchState);

    return {
      ...base,
      ...parsed,
      searchState: {
        part: typeof mergedSearchState.part === "string" ? mergedSearchState.part.trim() : "",
        brand: typeof mergedSearchState.brand === "string" ? mergedSearchState.brand.trim() : "",
        autoBrand:
          typeof mergedSearchState.autoBrand === "string"
            ? mergedSearchState.autoBrand.trim()
            : "",
        model: typeof mergedSearchState.model === "string" ? mergedSearchState.model.trim() : "",
        year: typeof mergedSearchState.year === "string" ? mergedSearchState.year.trim() : "",
        missingFields,
        readyForDbSearch: missingFields.length === 0,
        lastAskedField: missingFields[0] || "",
      },
      searchResults: {
        hasSearched: Boolean(parsed.searchResults?.hasSearched),
        totalFound: Number(parsed.searchResults?.totalFound || 0),
        items: normalizeSearchItems(parsed.searchResults?.items),
        lastQueryText:
          typeof parsed.searchResults?.lastQueryText === "string"
            ? parsed.searchResults.lastQueryText.trim()
            : "",
      },
      reservationState: {
        part:
          typeof parsed.reservationState?.part === "string"
            ? parsed.reservationState.part.trim()
            : "",
        quantity:
          typeof parsed.reservationState?.quantity === "string"
            ? parsed.reservationState.quantity.trim()
            : "",
        pickupDate:
          typeof parsed.reservationState?.pickupDate === "string"
            ? parsed.reservationState.pickupDate.trim()
            : "",
        selectedProductId:
          parsed.reservationState?.selectedProductId != null
            ? Number(parsed.reservationState.selectedProductId)
            : null,
        selectedProductName:
          typeof parsed.reservationState?.selectedProductName === "string"
            ? parsed.reservationState.selectedProductName.trim()
            : "",
        status:
          typeof parsed.reservationState?.status === "string"
            ? parsed.reservationState.status.trim()
            : "",
        reservationId:
          parsed.reservationState?.reservationId != null
            ? Number(parsed.reservationState.reservationId)
            : null,
        expiresAt:
          typeof parsed.reservationState?.expiresAt === "string"
            ? parsed.reservationState.expiresAt.trim()
            : "",
        lastAction:
          parsed.reservationState?.lastAction === "created" ||
          parsed.reservationState?.lastAction === "failed"
            ? parsed.reservationState.lastAction
            : "",
      },
      notes: Array.isArray(parsed.notes)
        ? parsed.notes.filter((item: unknown): item is string => typeof item === "string")
        : [],
      openQuestion: typeof parsed.openQuestion === "string" ? parsed.openQuestion : "",
    };
  } catch {
    return createEmptyChatSummaryState();
  }
}