import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

interface RouteContext {
  params: Promise<{
    chatId: string;
  }>;
}

export async function GET(_req: Request, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Niet ingelogd." },
        { status: 401 }
      );
    }

    const { chatId } = await context.params;

    if (!chatId || Number.isNaN(Number(chatId))) {
      return NextResponse.json(
        { message: "Ongeldige chat id." },
        { status: 400 }
      );
    }

    const userResult = await query(
      `SELECT user_id FROM users WHERE email = $1 LIMIT 1`,
      [session.user.email]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { message: "Gebruiker niet gevonden." },
        { status: 404 }
      );
    }

    const userId = userResult.rows[0].user_id;

    const chatCheck = await query(
      `
      SELECT chat_id
      FROM chats
      WHERE chat_id = $1 AND user_id = $2
      LIMIT 1
      `,
      [chatId, userId]
    );

    if (chatCheck.rows.length === 0) {
      return NextResponse.json(
        { message: "Chat niet gevonden of geen toegang." },
        { status: 404 }
      );
    }

    const messagesResult = await query(
      `
      SELECT message_id, chat_id, role, content, sequence_number, created_at
      FROM messages
      WHERE chat_id = $1
      ORDER BY sequence_number ASC, created_at ASC
      `,
      [chatId]
    );

    return NextResponse.json({
      messages: messagesResult.rows,
    });
  } catch (error) {
    console.error("❌ GET /api/chats/[chatId]/messages error:", error);

    return NextResponse.json(
      { message: "Kon messages niet ophalen." },
      { status: 500 }
    );
  }
}