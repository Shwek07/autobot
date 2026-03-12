import type {
  ChatRequestBody,
  ChatResponseBody,
  ChatSummaryState,
  SearchResultItem,
} from "../types";
import { parseChatSummary } from "../chatState";
import { createReservation } from "../reservationDB";
import Groq from "groq-sdk";

interface ReservationHandlerParams extends ChatRequestBody {
  userId?: number;
}

function extractQuantity(message: string, fallback = 1): number {
  const match = message.match(/\b(\d+)\b/);
  if (!match) return fallback;
  const value = Number(match[1]);
  if (!Number.isFinite(value) || value <= 0) return fallback;
  return value;
}

function pickReservationProduct(
  summary: ChatSummaryState,
  message: string
): SearchResultItem | null {
  const items = summary.searchResults?.items || [];
  if (!items.length) return null;

  const text = message.toLowerCase().trim();

  const byProductName = items.find((item) =>
    text.includes(item.productName.toLowerCase())
  );
  if (byProductName) return byProductName;

  const byPartNumber = items.find(
    (item) => item.partNumber && text.includes(item.partNumber.toLowerCase())
  );
  if (byPartNumber) return byPartNumber;

  const bySku = items.find((item) => item.sku && text.includes(item.sku.toLowerCase()));
  if (bySku) return bySku;

  return items[0];
}

async function generateReservationReply(params: {
  summary: ChatSummaryState;
  success: boolean;
  quantity: number;
  selectedProduct: SearchResultItem | null;
}): Promise<string> {
  const { summary, success, quantity, selectedProduct } = params;

  const fallback = success
    ? `Je reservering is gelukt. Ik heb ${quantity} stuk(s) van ${selectedProduct?.productName || "het product"} op jouw naam gezet.`
    : `Het is niet gelukt om de reservering aan te maken voor ${selectedProduct?.productName || "het product"}.`;

  const apiKey = (process.env.GROQ_API_KEY || "").trim();
  const modelName = (process.env.GROQ_MODEL || "llama-3.3-70b-versatile").trim();

  if (!apiKey) return fallback;

  try {
    const client = new Groq({ apiKey });

    const prompt = `
Je bent AutoBot van een autoparts shop.

Schrijf een korte, nette Nederlandse reactie voor de gebruiker.

Regels:
- Als success = true: bevestig dat de reservering is gelukt
- Noem productnaam, aantal, status en eventueel vervaltijd
- Zeg dat het op naam van de gebruiker is gezet
- Als success = false: zeg netjes dat het niet gelukt is
- Houd het kort en duidelijk
- Geen JSON
- Geen markdown

SUCCESS:
${JSON.stringify(success)}

SELECTED PRODUCT:
${JSON.stringify(selectedProduct, null, 2)}

RESERVATION STATE:
${JSON.stringify(summary.reservationState, null, 2)}
    `.trim();

    const completion = await client.chat.completions.create({
      model: modelName,
      temperature: 0.2,
      messages: [{ role: "user", content: prompt }],
    });

    return completion.choices?.[0]?.message?.content?.trim() || fallback;
  } catch {
    return fallback;
  }
}

export async function handleReservation(
  body: ReservationHandlerParams
): Promise<ChatResponseBody> {
  try {
    const summary = parseChatSummary(body.chatSummary);
    const message = String(body.message || "").trim();

    const selectedProduct = pickReservationProduct(summary, message);

    if (!selectedProduct) {
      summary.intent = "RESERVATION";
      summary.reservationState = {
        ...summary.reservationState,
        status: "failed",
        lastAction: "failed",
      };

      return {
        message:
          "Ik kon geen product selecteren om te reserveren. Zoek eerst een onderdeel en kies daarna welk item je wilt reserveren.",
        intent: "RESERVATION",
        suggestions: [],
        summary: JSON.stringify(summary, null, 2),
      };
    }

    if (!body.userId) {
      summary.intent = "RESERVATION";
      summary.reservationState = {
        ...summary.reservationState,
        part: selectedProduct.productName,
        quantity: "1",
        selectedProductId: selectedProduct.productId,
        selectedProductName: selectedProduct.productName,
        status: "failed",
        lastAction: "failed",
      };

      return {
        message: "Ik kon je account niet koppelen, dus de reservering is niet gemaakt.",
        intent: "RESERVATION",
        suggestions: [],
        summary: JSON.stringify(summary, null, 2),
      };
    }

    const quantity = extractQuantity(message, 1);

    const reservation = await createReservation({
      userId: body.userId,
      productId: selectedProduct.productId,
      quantity,
      status: "pending",
      expiresHours: 5,
    });

    summary.intent = "RESERVATION";
    summary.reservationState = {
      part: selectedProduct.productName,
      quantity: String(quantity),
      pickupDate: summary.reservationState.pickupDate || "",
      selectedProductId: selectedProduct.productId,
      selectedProductName: selectedProduct.productName,
      status: reservation.status,
      reservationId: reservation.reservationId,
      expiresAt: reservation.expiresAt,
      lastAction: "created",
    };
    summary.openQuestion = "";

    const reply = await generateReservationReply({
      summary,
      success: true,
      quantity,
      selectedProduct,
    });

    return {
      message: reply,
      intent: "RESERVATION",
      suggestions: [],
      summary: JSON.stringify(summary, null, 2),
    };
  } catch (error) {
    console.error("handleReservation error:", error);

    const summary = parseChatSummary(body.chatSummary);
    summary.intent = "RESERVATION";
    summary.reservationState = {
      ...summary.reservationState,
      status: "failed",
      lastAction: "failed",
    };

    return {
      message: "Het is niet gelukt om de reservering op jouw naam te zetten.",
      intent: "RESERVATION",
      suggestions: [],
      summary: JSON.stringify(summary, null, 2),
    };
  }
}