export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { detectIntent } from "@/lib/chatbot/intent";
import { handleSearch } from "@/lib/chatbot/handlers/search";
import { handleReservation } from "@/lib/chatbot/handlers/reservation";
import { handleGeneral } from "@/lib/chatbot/handlers/general";
import { getClient, query } from "@/lib/db";
import {
  getLatestChatSummary,
  buildUpdatedSummary,
  saveChatSummary,
} from "@/lib/chatbot/summary";

import type {
  ChatRequestBody,
  ChatResponseBody,
  ChatHistoryItem,
  ChatHistorySender,
} from "@/lib/chatbot/types";

type ChatIntent = "SEARCH" | "RESERVATION" | "GENERAL";

type SearchSummaryPayload = {
  intent?: string;
  searchState?: {
    part?: string;
    brand?: string;
    autoBrand?: string;
    model?: string;
    year?: string;
    missingFields?: string[];
    readyForDbSearch?: boolean;
    lastAskedField?: string;
  };
  searchResults?: {
    hasSearched?: boolean;
    totalFound?: number;
    items?: Array<{
      productId?: number;
      productName?: string;
      productBrand?: string;
      categoryName?: string;
      partNumber?: string;
      sku?: string;
      salePrice?: number | null;
      stockQuantity?: number | null;
      autoBrand?: string;
      autoModel?: string;
      year?: number | null;
      compatibilityId?: number | null;
    }>;
    lastQueryText?: string;
  };
  reservationState?: {
    part?: string;
    quantity?: string;
    pickupDate?: string;
    selectedProductId?: number | null;
    selectedProductName?: string;
    status?: string;
    reservationId?: number | null;
    expiresAt?: string;
    lastAction?: "created" | "failed" | "";
  };
  notes?: string[];
  openQuestion?: string;
};

async function getUserIdByEmail(email: string): Promise<number | null> {
  const result = await query(
    `
    SELECT user_id
    FROM users
    WHERE email = $1
    LIMIT 1
    `,
    [email]
  );

  if (result.rows.length === 0) return null;
  return Number(result.rows[0].user_id);
}

async function validateAndLockChat(
  client: Awaited<ReturnType<typeof getClient>>,
  chatId: number,
  userId: number
) {
  const result = await client.query(
    `
    SELECT chat_id, title
    FROM chats
    WHERE chat_id = $1 AND user_id = $2
    FOR UPDATE
    `,
    [chatId, userId]
  );

  return result.rows[0] ?? null;
}

async function getCurrentMaxSequence(
  client: Awaited<ReturnType<typeof getClient>>,
  chatId: number
): Promise<number> {
  const result = await client.query(
    `
    SELECT COALESCE(MAX(sequence_number), 0) AS max_sequence
    FROM messages
    WHERE chat_id = $1
    `,
    [chatId]
  );

  return Number(result.rows[0].max_sequence);
}

async function getRecentChatHistory(
  chatId: number,
  limit = 6
): Promise<ChatHistoryItem[]> {
  const result = await query(
    `
    SELECT role, content, created_at, sequence_number
    FROM messages
    WHERE chat_id = $1
      AND role IN ('user', 'assistant')
    ORDER BY sequence_number DESC, created_at DESC
    LIMIT $2
    `,
    [chatId, limit]
  );

  return result.rows.reverse().map((row: any): ChatHistoryItem => {
    const sender: ChatHistorySender =
      row.role === "assistant" ? "assistant" : "user";

    return {
      sender,
      text: String(row.content || ""),
    };
  });
}

function tryParseJson<T = unknown>(value: string): T | null {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function extractSearchSummaryFromResponse(
  response: ChatResponseBody & { intent?: ChatIntent }
): string | null {
  if (response.intent !== "SEARCH") {
    return null;
  }

  const rawSummary =
    typeof response.summary === "string" ? response.summary.trim() : "";

  if (!rawSummary) {
    return null;
  }

  const parsed = tryParseJson<SearchSummaryPayload>(rawSummary);

  if (!parsed || typeof parsed !== "object") {
    return null;
  }

  try {
    return JSON.stringify(parsed, null, 2);
  } catch {
    return null;
  }
}

function buildSearchFallbackAssistantMessage(summary?: string): string {
  if (!summary?.trim()) {
    return "Ik help je graag verder. Geef me het onderdeel, het merk, het automerk, het model en het bouwjaar.";
  }

  const parsed = tryParseJson<SearchSummaryPayload>(summary);

  if (!parsed || typeof parsed !== "object") {
    return "Ik help je graag verder. Geef me het onderdeel, het merk, het automerk, het model en het bouwjaar.";
  }

  if (parsed.searchResults?.hasSearched) {
    const totalFound = Number(parsed.searchResults?.totalFound || 0);

    if (totalFound > 0) {
      return `Ik heb ${totalFound} resultaat${totalFound === 1 ? "" : "en"} gevonden in de database.`;
    }

    return "Ik heb geen passend resultaat gevonden in de database.";
  }

  const searchState = parsed.searchState;
  const readyForDbSearch = Boolean(searchState?.readyForDbSearch);

  if (readyForDbSearch) {
    return "Top, ik heb genoeg informatie verzameld en ga nu zoeken in de database.";
  }

  const openQuestion =
    typeof parsed.openQuestion === "string" ? parsed.openQuestion.trim() : "";

  if (openQuestion) {
    return openQuestion;
  }

  return "Ik help je graag verder. Geef me het onderdeel, het merk, het automerk, het model en het bouwjaar.";
}

function buildClientSafeResponse(
  response: ChatResponseBody & { intent?: ChatIntent }
): ChatResponseBody & { intent?: ChatIntent } {
  if (response.intent !== "SEARCH") {
    return response;
  }

  return {
    ...response,
    message:
      String(response.message || "").trim() ||
      buildSearchFallbackAssistantMessage(response.summary),
  };
}

async function runIntentHandler(
  body: ChatRequestBody,
  userId?: number
): Promise<ChatResponseBody & { intent?: ChatIntent }> {
  const intentResult = await detectIntent(body);

  let response: ChatResponseBody;

  switch (intentResult.intent) {
    case "SEARCH":
      response = await handleSearch(body);
      break;
    case "RESERVATION":
      response = await handleReservation({
        ...body,
        userId,
      });
      break;
    default:
      response = await handleGeneral(body);
      break;
  }

  response.intent = intentResult.intent;
  return response;
}

export async function POST(req: Request) {
  let client: Awaited<ReturnType<typeof getClient>> | null = null;

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Niet ingelogd." }, { status: 401 });
    }

    const body = (await req.json()) as ChatRequestBody;
    const userMessage = String(body?.message || "").trim();
    const localChatId = Number(body?.localChatId);

    if (!userMessage) {
      return NextResponse.json({ message: "Bericht is leeg." }, { status: 400 });
    }

    if (!localChatId || Number.isNaN(localChatId)) {
      return NextResponse.json(
        { message: "Ongeldige chat id." },
        { status: 400 }
      );
    }

    const userId = await getUserIdByEmail(session.user.email);

    if (!userId) {
      return NextResponse.json(
        { message: "Gebruiker niet gevonden." },
        { status: 404 }
      );
    }

    const latestSummary = await getLatestChatSummary(localChatId);

    client = await getClient();
    await client.query("BEGIN");

    const lockedChat = await validateAndLockChat(client, localChatId, userId);

    if (!lockedChat) {
      await client.query("ROLLBACK");
      client.release();
      client = null;

      return NextResponse.json(
        { message: "Chat niet gevonden of geen toegang." },
        { status: 404 }
      );
    }

    const maxSequence1 = await getCurrentMaxSequence(client, localChatId);
    const userSequence = maxSequence1 + 1;

    await client.query(
      `
      INSERT INTO messages (chat_id, role, content, sequence_number)
      VALUES ($1, 'user', $2, $3)
      `,
      [localChatId, userMessage, userSequence]
    );

    await client.query(
      `
      UPDATE chats
      SET updated_at = NOW(),
          title = CASE
            WHEN title = 'Nieuwe chat' OR title IS NULL OR title = ''
            THEN $2
            ELSE title
          END
      WHERE chat_id = $1
      `,
      [localChatId, userMessage.slice(0, 30)]
    );

    await client.query("COMMIT");
    client.release();
    client = null;

    const recentHistory = await getRecentChatHistory(localChatId, 6);

    const bodyWithContext: ChatRequestBody = {
      ...body,
      localChatId,
      chatSummary: latestSummary || "",
      history: recentHistory,
    };

    const handlerResponse = await runIntentHandler(bodyWithContext, userId);
    const rawAssistantMessage = String(handlerResponse?.message || "").trim();

    let summaryToSave = "";
    let assistantMessageToStore = rawAssistantMessage;

    if (handlerResponse.intent === "SEARCH") {
      const searchSummary = extractSearchSummaryFromResponse(handlerResponse);

      if (searchSummary) {
        summaryToSave = searchSummary;
      }

      if (!assistantMessageToStore) {
        assistantMessageToStore =
          buildSearchFallbackAssistantMessage(summaryToSave);
      }
    } else {
      try {
        const updatedSummary = await buildUpdatedSummary({
          previousSummary: latestSummary || "",
          userMessage,
          assistantMessage: rawAssistantMessage,
        });

        if (updatedSummary && updatedSummary.trim()) {
          summaryToSave = updatedSummary.trim();
        }
      } catch (summaryError) {
        console.error("chat summary error:", summaryError);
      }
    }

    if (assistantMessageToStore) {
      client = await getClient();
      await client.query("BEGIN");

      const lockedChat2 = await validateAndLockChat(client, localChatId, userId);

      if (!lockedChat2) {
        await client.query("ROLLBACK");
        client.release();
        client = null;

        return NextResponse.json(
          { message: "Chat niet gevonden of geen toegang." },
          { status: 404 }
        );
      }

      const maxSequence2 = await getCurrentMaxSequence(client, localChatId);
      const assistantSequence = maxSequence2 + 1;

      await client.query(
        `
        INSERT INTO messages (chat_id, role, content, sequence_number)
        VALUES ($1, 'assistant', $2, $3)
        `,
        [localChatId, assistantMessageToStore, assistantSequence]
      );

      await client.query(
        `
        UPDATE chats
        SET updated_at = NOW()
        WHERE chat_id = $1
        `,
        [localChatId]
      );

      await client.query("COMMIT");
      client.release();
      client = null;
    }

    if (summaryToSave && summaryToSave.trim()) {
      try {
        await saveChatSummary(localChatId, summaryToSave.trim());
      } catch (summarySaveError) {
        console.error("saveChatSummary error:", summarySaveError);
      }
    }

    const clientSafeResponse = buildClientSafeResponse({
      ...handlerResponse,
      message: assistantMessageToStore,
      summary: summaryToSave || handlerResponse.summary,
    });

    return NextResponse.json(clientSafeResponse);
  } catch (err: any) {
    if (client) {
      try {
        await client.query("ROLLBACK");
      } catch {}
      client.release();
    }

    console.error("/api/chatbot error:", err);

    const message = err?.message?.toLowerCase() ?? "";

    const isAiServiceDown =
      message.includes("api key") ||
      message.includes("unauthorized") ||
      message.includes("quota") ||
      message.includes("rate limit") ||
      message.includes("429") ||
      message.includes("498") ||
      message.includes("500") ||
      message.includes("502") ||
      message.includes("503");

    if (isAiServiceDown) {
      return NextResponse.json({ message: "AI_SERVICE_DOWN" }, { status: 503 });
    }

    return NextResponse.json(
      { message: "Server error in chatbot route." },
      { status: 500 }
    );
  }
}