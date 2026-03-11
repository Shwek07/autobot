export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { detectIntent } from "@/lib/chatbot/intent";
import type { ChatRequestBody, ChatResponseBody } from "@/lib/chatbot/types";
import { handleSearch } from "@/lib/chatbot/handlers/search";
import { handleReservation } from "@/lib/chatbot/handlers/reservation";
import { handleSmalltalk } from "@/lib/chatbot/handlers/smalltalk";
import { handleGeneral } from "@/lib/chatbot/handlers/general";
import { getClient, query } from "@/lib/db";

async function getUserIdByEmail(email: string): Promise<number | null> {
  const result = await query(
    `SELECT user_id FROM users WHERE email = $1 LIMIT 1`,
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

async function runIntentHandler(
  body: ChatRequestBody
): Promise<ChatResponseBody & { intent?: "SEARCH" | "RESERVATION" | "GENERAL" | "SMALLTALK" }> {
  const intentResult = await detectIntent(body);

  let response: ChatResponseBody;

  switch (intentResult.intent) {
    case "SEARCH":
      response = await handleSearch(body);
      break;
    case "RESERVATION":
      response = await handleReservation(body);
      break;
    case "SMALLTALK":
      response = await handleSmalltalk(body);
      break;
    default:
      response = await handleGeneral(body);
      break;
  }

  response.intent = intentResult.intent;
  return response;
}

export async function POST(req: Request) {
  let client = null;

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Niet ingelogd." },
        { status: 401 }
      );
    }

    const body = (await req.json()) as ChatRequestBody;
    const userMessage = String(body?.message || "").trim();
    const localChatId = Number(body?.localChatId);

    if (!userMessage) {
      return NextResponse.json(
        { message: "Bericht is leeg." },
        { status: 400 }
      );
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

    client = await getClient();

    await client.query("BEGIN");

    const lockedChat = await validateAndLockChat(client, localChatId, userId);

    if (!lockedChat) {
      await client.query("ROLLBACK");
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

    const response = await runIntentHandler(body);
    const assistantMessage = String(response?.message || "").trim();

    if (assistantMessage) {
      client = await getClient();
      await client.query("BEGIN");

      const lockedChat2 = await validateAndLockChat(client, localChatId, userId);

      if (!lockedChat2) {
        await client.query("ROLLBACK");
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
        [localChatId, assistantMessage, assistantSequence]
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

    return NextResponse.json(response);
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
      return NextResponse.json(
        { message: "AI_SERVICE_DOWN" },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { message: "Server error in chatbot route." },
      { status: 500 }
    );
  }
}