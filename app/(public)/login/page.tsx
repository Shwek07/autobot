// app/(public)/login/page.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import styles from "./login.module.css";

export default function LoginPage() {
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    setMounted(true);
  }, []);

  // ✅ Respect callbackUrl from query string (used by reserve flow)
  const callbackUrl = useMemo(() => {
    const cb = searchParams.get("callbackUrl");
    // fallback if none provided
    return cb && cb.trim().length > 0 ? cb : "/";
  }, [searchParams]);

  if (!mounted) return null;

  const handleGoogleLogin = () => {
    // ✅ this is the key fix: do NOT hardcode "/"
    signIn("google", { callbackUrl });
  };

  return (
    <div className={styles.wrapper}>
      {/* Background */}
      <div className={styles.bgGrid} />
      <div className={styles.bgGradient} />
      <div className={styles.bgGlow} />

      <div className={styles.container}>
        {/* LEFT SIDE */}
        <div className={styles.brandSide}>
          <div className={styles.brandContent}>
            <h2 className={styles.brandTitle}>
              Vind onderdelen voor
              <br />
              jouw auto in seconden
            </h2>

            <div className={styles.statsContainer}>
              <Stat number="1000+" label="Onderdelen" />
              <Stat number="24/7" label="Beschikbaar" />
              <Stat number="98%" label="Tevreden" />
            </div>

            <div className={styles.featureList}>
              <Feature text="Directe levering uit voorraad" />
              <Feature text="7 dagen retourrecht" />
              <Feature text="Persoonlijke ondersteuning" />
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className={styles.loginCard}>
          <h1 className={styles.loginTitle}>Welkom terug</h1>
          <p className={styles.loginSubtitle}>
            Log in om verder te gaan.
          </p>

          {/* Google Button */}
          <button className={styles.googleButton} onClick={handleGoogleLogin}>
            <Image
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              width={20}
              height={20}
            />
            <span>Doorgaan met Google</span>
          </button>

          <div className={styles.divider}>
            <span>of log in met e-mail</span>
          </div>

          {/* Email login is UI-only for now (no submit handler) */}
          <form
            className={styles.emailForm}
            onSubmit={(e) => {
              e.preventDefault();
              alert("Email login is nog niet gekoppeld. Gebruik voorlopig Google login.");
            }}
          >
            <input
              type="email"
              placeholder="E-mailadres"
              className={styles.input}
              autoComplete="email"
            />
            <input
              type="password"
              placeholder="Wachtwoord"
              className={styles.input}
              autoComplete="current-password"
            />
            <button type="submit" className={styles.loginButton}>
              Inloggen
            </button>
          </form>

          <div className={styles.loginFooter}>
            <a href="/forgot-password" className={styles.link}>
              Wachtwoord vergeten?
            </a>
            <span className={styles.footerText}>
              Nog geen account?{" "}
              <a href="/register" className={styles.link}>
                Registreer
              </a>
            </span>
          </div>

          <p className={styles.termsText}>
            Door door te gaan ga je akkoord met onze{" "}
            <a href="/terms" className={styles.link}>
              Algemene Voorwaarden
            </a>{" "}
            en{" "}
            <a href="/privacy" className={styles.link}>
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

// Components
function Feature({ text }: { text: string }) {
  return (
    <div className={styles.featureItem}>
      <svg width="20" height="20" fill="none" stroke="#34ebeb" strokeWidth="2.5">
        <path d="M20 6L9 17L4 12" strokeLinecap="round" />
      </svg>
      <span>{text}</span>
    </div>
  );
}

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div className={styles.statItem}>
      <span className={styles.statNumber}>{number}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  );
}