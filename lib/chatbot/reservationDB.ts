import { query } from "@/lib/db";

export interface ReservationInsertResult {
  reservationId: number;
  status: string;
  expiresAt: string;
}

export async function createReservation(params: {
  userId: number;
  productId: number;
  quantity: number;
  status?: string;
  expiresHours?: number;
}): Promise<ReservationInsertResult> {
  const status = (params.status || "pending").trim();
  const expiresHours =
    typeof params.expiresHours === "number" && params.expiresHours > 0
      ? params.expiresHours
      : 5;

  const result = await query(
    `
    INSERT INTO reservations (
      user_id,
      product_id,
      quantity,
      status,
      reserved_at,
      expires_at
    )
    VALUES (
      $1,
      $2,
      $3,
      $4,
      NOW(),
      NOW() + ($5 || ' hours')::interval
    )
    RETURNING reservation_id, status, expires_at
    `,
    [params.userId, params.productId, params.quantity, status, String(expiresHours)]
  );

  const row = result.rows[0];

  return {
    reservationId: Number(row.reservation_id),
    status: String(row.status || status),
    expiresAt: row.expires_at ? new Date(row.expires_at).toISOString() : "",
  };
}