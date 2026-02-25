import styles from "../Dashboard.module.css";

export default function StatsCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: string;
}) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statIcon}>{icon}</div>
      <div>
        <div className={styles.statTitle}>{title}</div>
        <div className={styles.statValue}>{value}</div>
      </div>
    </div>
  );
}
