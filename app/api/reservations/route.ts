// app/api/reservations/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

// GET - Alle reserveringen van gebruiker ophalen
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || session.user?.id;

    if (userId !== session.user?.id && session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
    }

    const result = await query(
      `SELECT 
        r.reservation_id,
        r.user_id,
        r.product_id,
        r.quantity,
        r.status,
        r.reserved_at,
        r.expires_at,
        p.product_name,
        p.product_merk,
        p.sku,
        p.part_number,
        p.verkoop_prijs,
        p.description
       FROM reservations r
       LEFT JOIN products p ON r.product_id::integer = p.product_id
       WHERE r.user_id = $1 
       ORDER BY r.reserved_at DESC`,
      [userId]
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Nieuwe reservering aanmaken (voor chatbot)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }

    const body = await req.json();
    const { product_id, quantity = "1", product_name, product_details } = body;

    // Bereken vervaltijd (5 uur vanaf nu)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 5);

    // Controleer of gebruiker al een actieve reservering heeft
    const existing = await query(
      `SELECT * FROM reservations 
       WHERE user_id = $1 AND product_id = $2 AND status = 'pending' 
       AND expires_at > NOW()`,
      [session.user?.id, product_id]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: "Je hebt al een actieve reservering voor dit product" },
        { status: 400 }
      );
    }

    // Maak nieuwe reservering
    const result = await query(
      `INSERT INTO reservations 
       (user_id, product_id, quantity, status, reserved_at, expires_at) 
       VALUES ($1, $2, $3, $4, NOW(), $5) 
       RETURNING *`,
      [session.user?.id, product_id, quantity, 'pending', expiresAt]
    );

    return NextResponse.json({
      success: true,
      message: `✅ ${product_name || 'Product'} is gereserveerd! Je hebt 5 uur om te komen bezichtigen.`,
      reservation: result.rows[0]
    }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Er is een fout opgetreden bij het reserveren" },
      { status: 500 }
    );
  }
}

// PUT - Reservering bijwerken (bijv. aantal wijzigen)
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }

    const body = await req.json();
    const { reservation_id, quantity } = body;

    // Controleer of de reservering van deze gebruiker is
    const checkResult = await query(
      `SELECT * FROM reservations WHERE reservation_id = $1 AND user_id = $2`,
      [reservation_id, session.user?.id]
    );

    if (checkResult.rows.length === 0) {
      return NextResponse.json({ error: "Reservering niet gevonden" }, { status: 404 });
    }

    const result = await query(
      `UPDATE reservations 
       SET quantity = $1 
       WHERE reservation_id = $2 
       RETURNING *`,
      [quantity, reservation_id]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Reservering annuleren
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const reservation_id = searchParams.get("id");

    if (!reservation_id) {
      return NextResponse.json({ error: "Reservation ID required" }, { status: 400 });
    }

    // Controleer of de reservering van deze gebruiker is
    const checkResult = await query(
      `SELECT * FROM reservations WHERE reservation_id = $1 AND user_id = $2`,
      [reservation_id, session.user?.id]
    );

    if (checkResult.rows.length === 0) {
      return NextResponse.json({ error: "Reservering niet gevonden" }, { status: 404 });
    }

    // Verwijder de reservering (of zet op cancelled)
    await query(
      `DELETE FROM reservations WHERE reservation_id = $1`,
      [reservation_id]
    );

    return NextResponse.json({ 
      success: true, 
      message: "Reservering geannuleerd" 
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}