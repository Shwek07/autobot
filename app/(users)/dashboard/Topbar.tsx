"use client";
import styles from "../Dashboard.module.css";

export default function Topbar() {
  function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme");
    const newTheme = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  }

  return (
    <div className={styles.topbar}>
      <h1>Mijn Dashboard</h1>

      <div className={styles.topActions}>
        <button onClick={toggleTheme} className={styles.themeBtn}>
          🌙 / ☀️
        </button>

        <div className={styles.avatar}>👤</div>
      </div>
    </div>
  );
}
