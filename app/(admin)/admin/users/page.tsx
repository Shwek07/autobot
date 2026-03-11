// app/(admin)/admin/users/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import styles from "./users.module.css";

interface User {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  roles: string;
  created_at: string;
  is_active: number;
}

export default function UsersPage() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;

    if (session?.user?.role !== "ADMIN") {
      setError("Unauthorized: only admins can view this page.");
      setLoading(false);
      return;
    }

    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/admin/users");
        if (!res.ok) throw new Error(`Error fetching users: ${res.status}`);
        const data: User[] = await res.json();
        setUsers(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [session, status]);

  const toggleUser = async (user: User) => {
    try {
      const res = await fetch(`/api/admin/users/${user.user_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          is_active: user.is_active ? 0 : 1,
          roles: user.roles,
        }),
      });

      if (!res.ok) throw new Error(`Failed to update user: ${res.status}`);

      setUsers((prev) =>
        prev.map((u) =>
          u.user_id === user.user_id
            ? { ...u, is_active: u.is_active ? 0 : 1 }
            : u
        )
      );
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to toggle user");
    }
  };

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
  const first = firstName?.charAt(0) || "";
  const last = lastName?.charAt(0) || "";
  return `${first}${last}`.toUpperCase() || "?";
};

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (status === "loading" || loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.loadingText}>Gebruikers laden...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>!</div>
          <p className={styles.errorText}>{error}</p>
          <button 
            className={styles.retryBtn}
            onClick={() => window.location.reload()}
          >
            Opnieuw proberen
          </button>
        </div>
      </div>
    );
  }

  const activeUsers = users.filter(u => u.is_active).length;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Gebruikersbeheer</h1>
        <div className={styles.stats}>
          <span>{activeUsers}</span> actief · <span>{users.length - activeUsers}</span> inactief
        </div>
      </div>

      <div className={styles.cardsWrapper}>
        {users.map((user) => (
          <div key={user.user_id} className={styles.userCard}>
            <div className={styles.userHeader}>
              <div className={styles.avatar}>
                {getInitials(user.first_name, user.last_name)}
              </div>
              <div>
                <h3 className={styles.userName}>
                  {user.first_name} {user.last_name}
                </h3>
                <div className={styles.userEmail}>
                  <svg viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                  {user.email}
                </div>
              </div>
            </div>

            <div className={styles.userDetails}>
              <div className={styles.detailRow}>
                <span className={styles.detailIcon}>📱</span>
                <span className={styles.detailLabel}>Telefoon</span>
                <span className={styles.detailValue}>{user.phone || 'Niet opgegeven'}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailIcon}>👤</span>
                <span className={styles.detailLabel}>Rol</span>
                <span className={styles.detailValue}>
                  <span className={styles.roleBadge}>{user.roles}</span>
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailIcon}>📅</span>
                <span className={styles.detailLabel}>Lid sinds</span>
                <span className={styles.detailValue}>{formatDate(user.created_at)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div className={user.is_active ? styles.statusActive : styles.statusInactive}>
                <span className={styles.statusDot}></span>
                {user.is_active ? 'Actief' : 'Inactief'}
              </div>
            </div>

            <div className={styles.cardFooter}>
              <button
                onClick={() => toggleUser(user)}
                className={`${styles.toggleBtn} ${user.is_active ? styles.deactivate : ''}`}
              >
                <svg viewBox="0 0 24 24">
                  {user.is_active ? (
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z"/>
                  ) : (
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-9H6v2h4v-2zm6 0h-4v2h4v-2z"/>
                  )}
                </svg>
                {user.is_active ? 'Deactiveren' : 'Activeren'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}