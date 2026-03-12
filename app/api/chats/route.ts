// app/api/chats/route.ts
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; 


export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Niet ingelogd." },
        { status: 401 }
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

    const body = await req.json().catch(() => ({}));
    const title = body?.title?.trim() || "Nieuwe chat";

    const insertResult = await query(
      `
      INSERT INTO chats (user_id, title, status)
      VALUES ($1, $2, 'active')
      RETURNING chat_id, title, status, created_at, updated_at
      `,
      [userId, title]
    );

    const newChat = insertResult.rows[0];

    return NextResponse.json({
      message: "Chat succesvol aangemaakt.",
      chat: newChat,
    });
  } catch (error) {
    console.error("❌ POST /api/chats error:", error);

    return NextResponse.json(
      { message: "Er is iets misgegaan bij het aanmaken van de chat." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Niet ingelogd." },
        { status: 401 }
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

    const chatsResult = await query(
      `
      SELECT chat_id, title, status, created_at, updated_at
      FROM chats
      WHERE user_id = $1
      ORDER BY updated_at DESC
      `,
      [userId]
    );

    return NextResponse.json({
      chats: chatsResult.rows,
    });
  } catch (error) {
    console.error("❌ GET /api/chats error:", error);

    return NextResponse.json(
      { message: "Kon chats niet ophalen." },
      { status: 500 }
    );
  }
}