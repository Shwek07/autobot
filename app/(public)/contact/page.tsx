'use client';

import { useState } from "react";
import styles from "./contact.module.css";
import Link from "next/link";
import Footer from "@/components/footer/footer";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) throw new Error("Bericht verzenden mislukt");
      
      setSuccess(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
      });
      
      setTimeout(() => setSuccess(false), 5000);
      
    } catch (err) {
      setError("Er is iets misgegaan. Probeer het later opnieuw.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1>Contact</h1>
        <p>Wij helpen u graag met al uw auto-onderdelen</p>
      </div>

      <div className={styles.content}>
        
        {/* Contactinformatie */}
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <div className={styles.icon}>📍</div>
            <h3>Bezoek ons</h3>
            <p>Ramdhiansingstraat<br />Paramaribo, Suriname</p>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.icon}>📞</div>
            <h3>Bel ons</h3>
            <p>+597 868-5952</p>
            <p className={styles.small}>Ma - Vr: 08:00 - 18:00</p>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.icon}>✉️</div>
            <h3>E-mail ons</h3>
            <p>info@autobot.com</p>
            <p>support@autobot.com</p>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.icon}>💬</div>
            <h3>Live chat</h3>
            <p>Chat met ons team</p>

            <div className={styles.chatButtonContainer}>
              <Link href="/autobot" className={styles.chatButton}>
                Start chat
              </Link>
            </div>
          </div>
        </div>

        {/* Formulier & Kaart */}
        <div className={styles.formMapGrid}>
          
          {/* Contactformulier */}
          <div className={styles.formContainer}>
            <h2>Stuur ons een bericht</h2>
            
            {success && (
              <div className={styles.successMessage}>
                ✓ Bericht succesvol verzonden! Wij nemen zo spoedig mogelijk contact met u op.
              </div>
            )}
            
            {error && (
              <div className={styles.errorMessage}>
                ⚠ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="name">Volledige naam *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Jan Jansen"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="email">E-mailadres *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="jan@email.com"
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="phone">Telefoonnummer</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+597 868-5952"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="subject">Onderwerp *</label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selecteer een onderwerp</option>
                    <option value="general">Algemene vraag</option>
                    <option value="support">Technische ondersteuning</option>
                    <option value="parts">Informatie over onderdelen</option>
                    <option value="order">Bestelstatus</option>
                    <option value="feedback">Feedback</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="message">Bericht *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  placeholder="Hoe kunnen wij u helpen?"
                />
              </div>

              <button 
                type="submit" 
                className={styles.submitButton}
                disabled={loading}
              >
                {loading ? "Verzenden..." : "Bericht verzenden"}
              </button>
            </form>
          </div>

          {/* Kaart */}
          <div className={styles.mapContainer}>
            <h2>Onze locatie</h2>
            <div className={styles.map}>
              <iframe
                src="https://www.google.com/maps/embed?..."
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Locatie AutoBot"
              />
            </div>
            
            <div className={styles.hoursCard}>
              <h3>Openingstijden</h3>
              <div className={styles.hoursGrid}>
                <div>
                  <p><strong>Maandag - Vrijdag</strong></p>
                  <p>08:00 - 18:00</p>
                </div>
                <div>
                  <p><strong>Zaterdag</strong></p>
                  <p>09:00 - 16:00</p>
                </div>
                <div>
                  <p><strong>Zondag</strong></p>
                  <p>Gesloten</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className={styles.faqSection}>
          <h2>Veelgestelde vragen</h2>
          <div className={styles.faqGrid}>
            <div className={styles.faqItem}>
              <h3>Hoe snel reageren jullie?</h3>
              <p>Wij streven ernaar om tijdens werkdagen binnen 24 uur te reageren.</p>
            </div>
            <div className={styles.faqItem}>
              <h3>Bieden jullie internationale verzending aan?</h3>
              <p>Ja, wij verzenden wereldwijd. Neem contact met ons op voor specifieke tarieven.</p>
            </div>
            <div className={styles.faqItem}>
              <h3>Kan ik onderdelen retourneren?</h3>
              <p>Wij hanteren een retourtermijn van 30 dagen voor ongebruikte artikelen in originele verpakking.</p>
            </div>
            <div className={styles.faqItem}>
              <h3>Hebben jullie een fysieke winkel?</h3>
              <p>Ja, u bent welkom op onze locatie in Paramaribo tijdens openingstijden.</p>
            </div>
          </div>
          <div className={styles.faqCTA}>
            <p>Heeft u nog vragen?</p>
            <Link href="/faq" className={styles.faqButton}>
              Bekijk onze FAQ-pagina →
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
