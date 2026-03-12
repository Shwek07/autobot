// app/(users)/dashboard/ReservationsTable.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./dashboard.module.css";

interface Reservation {
  reservation_id: number;
  user_id: string;
  product_id: string;
  quantity: string;
  status: string;
  reserved_at: string;
  expires_at: string;
  product_name: string;
  product_merk: string;
  sku: string;
  part_number: string;
  verkoop_prijs: string;
  description: string;
}

export default function ReservationsTable() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editQuantity, setEditQuantity] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchReservations();
    
    const interval = setInterval(fetchReservations, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchReservations = async () => {
    try {
      const res = await fetch("/api/reservations");
      const data = await res.json();
      setReservations(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (reservationId: number) => {
    if (!confirm("Weet je zeker dat je deze reservering wilt annuleren?")) return;

    try {
      const res = await fetch(`/api/reservations?id=${reservationId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("Reservering geannuleerd");
        fetchReservations();
        router.refresh();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdate = async (reservationId: number) => {
    if (!editQuantity || parseInt(editQuantity) < 1) {
      alert("Voer een geldig aantal in");
      return;
    }

    try {
      const res = await fetch("/api/reservations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reservation_id: reservationId,
          quantity: editQuantity,
        }),
      });

      if (res.ok) {
        setEditingId(null);
        fetchReservations();
        router.refresh();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date().getTime();
    const expiry = new Date(expiresAt).getTime();
    const diff = expiry - now;

    if (diff <= 0) return "Verlopen";

    const uren = Math.floor(diff / (1000 * 60 * 60));
    const minuten = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${uren}u ${minuten}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    return new Intl.NumberFormat('nl-NL', { 
      style: 'currency', 
      currency: 'EUR' 
    }).format(numPrice);
  };

  if (loading) return <div className={styles.loading}>Reserveringen laden...</div>;

  const now = new Date();
  const activeReservations = reservations.filter(r => 
    r.status === "pending" && new Date(r.expires_at) > now
  );
  
  const expiredReservations = reservations.filter(r => 
    r.status === "expired" || new Date(r.expires_at) <= now
  );

  return (
    <div className={styles.card}>
      <div className={styles.tableHeader}>
        <h2>Mijn Reserveringen</h2>
        <p className={styles.note}>⏰ Reserveringen vervallen na 5 uur</p>
      </div>

      {activeReservations.length > 0 ? (
        <table className={styles.reservationsTable}>
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU / Artikelnummer</th>
              <th>Aantal</th>
              <th>Prijs</th>
              <th>Gereserveerd op</th>
              <th>Verloopt over</th>
              <th>Acties</th>
            </tr>
          </thead>
          <tbody>
            {activeReservations.map((res) => (
              <tr key={res.reservation_id}>
                <td>
                  <strong>{res.product_merk} {res.product_name}</strong>
                  {res.description && (
                    <p className={styles.productDescription}>{res.description.substring(0, 50)}...</p>
                  )}
                </td>
                <td>
                  {res.sku || res.part_number || 'N/A'}
                </td>
                <td>
                  {editingId === res.reservation_id ? (
                    <input
                      type="number"
                      min="1"
                      value={editQuantity}
                      onChange={(e) => setEditQuantity(e.target.value)}
                      className={styles.editInput}
                    />
                  ) : (
                    res.quantity
                  )}
                </td>
                <td>
                  {res.verkoop_prijs ? formatPrice(res.verkoop_prijs) : 'Prijs op aanvraag'}
                </td>
                <td>{formatDate(res.reserved_at)}</td>
                <td>
                  <span className={styles.countdown}>
                    ⏳ {getTimeRemaining(res.expires_at)}
                  </span>
                </td>
                <td>
                  <div className={styles.actionButtons}>
                    {editingId === res.reservation_id ? (
                      <>
                        <button
                          onClick={() => handleUpdate(res.reservation_id)}
                          className={`${styles.button} ${styles.saveButton}`}
                        >
                          💾 Opslaan
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className={`${styles.button} ${styles.cancelButton}`}
                        >
                          ✖ Annuleren
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setEditingId(res.reservation_id);
                            setEditQuantity(res.quantity);
                          }}
                          className={`${styles.button} ${styles.editButton}`}
                        >
                          ✏️ Wijzigen
                        </button>
                        <button
                          onClick={() => handleCancel(res.reservation_id)}
                          className={`${styles.button} ${styles.deleteButton}`}
                        >
                          🗑️ Annuleren
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className={styles.empty}>Je hebt geen actieve reserveringen</p>
      )}

      {expiredReservations.length > 0 && (
        <>
          <h3 className={styles.expiredTitle}>Verlopen Reserveringen</h3>
          <table className={styles.reservationsTable}>
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU / Artikelnummer</th>
                <th>Aantal</th>
                <th>Prijs</th>
                <th>Gereserveerd op</th>
                <th>Verlopen op</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {expiredReservations.map((res) => (
                <tr key={res.reservation_id} className={styles.expiredRow}>
                  <td>
                    <strong>{res.product_merk} {res.product_name}</strong>
                  </td>
                  <td>{res.sku || res.part_number || 'N/A'}</td>
                  <td>{res.quantity}</td>
                  <td>{res.verkoop_prijs ? formatPrice(res.verkoop_prijs) : 'Prijs op aanvraag'}</td>
                  <td>{formatDate(res.reserved_at)}</td>
                  <td>{formatDate(res.expires_at)}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles.expired}`}>
                      ✗ Verlopen
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}