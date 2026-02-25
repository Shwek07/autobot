import styles from "../Dashboard.module.css";

export default function RecentOrders() {
  const orders = [
    { id: "ORD-1023", part: "Remschijven BMW", status: "Verzonden" },
    { id: "ORD-1022", part: "Olie Filter Audi", status: "In behandeling" },
  ];

  return (
    <div className={styles.card}>
      <h2>Recente Bestellingen</h2>

      {orders.map((order) => (
        <div key={order.id} className={styles.orderRow}>
          <div>
            <strong>{order.id}</strong>
            <p>{order.part}</p>
          </div>
          <span className={styles.status}>{order.status}</span>
        </div>
      ))}
    </div>
  );
}
