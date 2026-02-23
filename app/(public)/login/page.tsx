// app/(public)/login/page.tsx

"use client";

import { signIn } from "next-auth/react";
import Image from "next/image";
import styles from "./login.module.css";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSession } from "next-auth/react";

export default function LoginPage() {
   const router = useRouter();
   const { data: session } = useSession();

    // Automatically redirect if logged in
  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      router.push("/admin/admin");
    } else if (session?.user?.role === "USER") {
      router.push("/users/dashboard");
    }
  }, [session, router]);
  return (
    <div className={styles.wrapper}>
      {/* Background animations */}
      <div className={styles.bgGrid}></div>
      <div className={styles.bgGradient}></div>
      <div className={styles.bgGlow}></div>

      <div className={styles.container}>
        {/* Left Side - Brand Showcase */}
        <div className={styles.brandSide}>
          <div className={styles.brandContent}>
            <div className={styles.brandHeader}>
              <span className={styles.brandMain}>CARPARTS</span>
              <span className={styles.brandExpert}>EXPERT</span>
            </div>
            <h2 className={styles.brandTitle}>
              Vind onderdelen voor<br />jouw auto in seconden
            </h2>

            {/* Stats */}
            <div className={styles.statsContainer}>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>1000+</span>
                <span className={styles.statLabel}>Onderdelen</span>
              </div>
              <div className={styles.statDivider}></div>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>24/7</span>
                <span className={styles.statLabel}>Beschikbaar</span>
              </div>
              <div className={styles.statDivider}></div>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>98%</span>
                <span className={styles.statLabel}>Tevreden</span>
              </div>
            </div>

            {/* Features */}
            <div className={styles.featureList}>
              <div className={styles.featureItem}>
                <svg width="20" height="20" fill="none" stroke="#1e88e5" strokeWidth="2.5">
                  <path d="M20 6L9 17L4 12" strokeLinecap="round"/>
                </svg>
                <span>Directe levering uit voorraad</span>
              </div>
              <div className={styles.featureItem}>
                <svg width="20" height="20" fill="none" stroke="#1e88e5" strokeWidth="2.5">
                  <path d="M12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22Z"/>
                  <path d="M12 6V12L16 14" strokeLinecap="round"/>
                </svg>
                <span>7 dagen retourrecht</span>
              </div>
              <div className={styles.featureItem}>
                <svg width="20" height="20" fill="none" stroke="#1e88e5" strokeWidth="2.5">
                  <path d="M20 21V19C20 17.939 19.579 16.922 18.828 16.172C18.078 15.422 17.061 15 16 15H8C6.939 15 5.922 15.422 5.172 16.172C4.422 16.922 4 17.939 4 19V21M16 7C16 9.209 14.209 11 12 11C9.791 11 8 9.209 8 7C8 4.791 9.791 3 12 3C14.209 3 16 4.791 16 7Z"/>
                </svg>
                <span>Persoonlijke ondersteuning</span>
              </div>
            </div>

            {/* Testimonial */}
            <div className={styles.testimonialBadge}>
              <div className={styles.stars}>
                {[...Array(5)].map((_, i) => (
                  <svg key={i} width="16" height="16" fill="#1e88e5">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                  </svg>
                ))}
              </div>
              <span className={styles.testimonialText}>4.9/5 van 10.000+ autobezitters</span>
            </div>
          </div>
        </div>

        {/* Right Side - Login */}
        <div className={styles.loginCard}>
          <h1 className={styles.loginTitle}>Welkom terug</h1>
          <p className={styles.loginSubtitle}>
            Log in om toegang te krijgen tot je persoonlijke dashboard
          </p>

          {/* Social Buttons */}
          <button
      onClick={async () => {
        const result = await signIn("google", { redirect: false });
        // After signIn, session will update and useEffect triggers redirect
      }}
            >
              <Image
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                width={20}
                height={20}
              />
              <span>Doorgaan met Google</span>
            </button>


         

          <div className={styles.divider}><span>of log in met e-mail</span></div>

          {/* Email Form */}
          <form className={styles.emailForm}>
            <input type="email" placeholder="E-mailadres" className={styles.input} />
            <input type="password" placeholder="Wachtwoord" className={styles.input} />
            <button type="submit" className={styles.loginButton}>Inloggen</button>
          </form>

          <div className={styles.loginFooter}>
            <a href="/forgot-password" className={styles.link}>Wachtwoord vergeten?</a>
            <span className={styles.footerText}>
              Nog geen account? <a href="/register" className={styles.link}>Registreer</a>
            </span>
          </div>
          <p className={styles.termsText}>
            Door door te gaan ga je akkoord met onze <a href="/terms" className={styles.link}>Algemene Voorwaarden</a> en <a href="/privacy" className={styles.link}>Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}