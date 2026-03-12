// app/api/chats/[chatId]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

interface RouteContext {
  params: Promise<{
    chatId: string;
  }>;
}

export async function DELETE(_req: Request, context: RouteContext) {
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

    await query(
      `
      DELETE FROM chats
      WHERE chat_id = $1 AND user_id = $2
      `,
      [chatId, userId]
    );

    return NextResponse.json({
      message: "Chat succesvol verwijderd.",
      deletedChatId: Number(chatId),
    });
  } catch (error) {
    console.error("❌ DELETE /api/chats/[chatId] error:", error);

    return NextResponse.json(
      { message: "Kon chat niet verwijderen." },
      { status: 500 }
    );
  }
}