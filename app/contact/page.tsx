'use client';

import { useState } from "react";
import styles from "./contact.module.css";
import Link from "next/link";

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
      
      if (!res.ok) throw new Error("Failed to send message");
      
      setSuccess(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
      });
      
      // Reset success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
      
    } catch (err) {
      setError("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <div className={styles.hero}>
        <h1>Contact Us</h1>
        <p>We're here to help with all your auto parts needs</p>
      </div>

      <div className={styles.content}>
        {/* Contact Information Cards */}
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <div className={styles.icon}>📍</div>
            <h3>Visit Us</h3>
            <p>123 Automotive Street<br />Paramaribo, Suriname</p>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.icon}>📞</div>
            <h3>Call Us</h3>
            <p>+597 868-5952</p>
            <p className={styles.small}>Mon-Fri: 8:00 - 18:00</p>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.icon}>✉️</div>
            <h3>Email Us</h3>
            <p>info@autobot.com</p>
            <p>support@autobot.com</p>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.icon}>💬</div>
            <h3>Live Chat</h3>
            <p>Chat with our team</p>

            <Link href="/autobot" className={styles.chatButton}>Start Chat</Link>
          </div>
        </div>

        {/* Contact Form & Map Section */}
        <div className={styles.formMapGrid}>
          {/* Contact Form */}
          <div className={styles.formContainer}>
            <h2>Send us a Message</h2>
            
            {success && (
              <div className={styles.successMessage}>
                ✓ Message sent successfully! We'll get back to you soon.
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
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="phone">Phone Number</label>
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
                  <label htmlFor="subject">Subject *</label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="parts">Parts Information</option>
                    <option value="order">Order Status</option>
                    <option value="feedback">Feedback</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  placeholder="How can we help you?"
                />
              </div>

              <button 
                type="submit" 
                className={styles.submitButton}
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>

          {/* Map */}
          <div className={styles.mapContainer}>
            <h2>Find Us</h2>
            <div className={styles.map}>
             <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3271.4753591227122!2d-55.22092962602925!3d5.829735730838518!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8d09cb510df14999%3A0xf50be9ee58f8dfe6!2sRamdhiansingstraat%2C%20Paramaribo%2C%20Suriname!5e1!3m2!1sen!2s!4v1771337738270!5m2!1sen!2s"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="AutoBot Location"
            />
            </div>
            
            {/* Business Hours */}
            <div className={styles.hoursCard}>
              <h3>Business Hours</h3>
              <div className={styles.hoursGrid}>
                <div>
                  <p><strong>Monday - Friday</strong></p>
                  <p>8:00 AM - 6:00 PM</p>
                </div>
                <div>
                  <p><strong>Saturday</strong></p>
                  <p>9:00 AM - 4:00 PM</p>
                </div>
                <div>
                  <p><strong>Sunday</strong></p>
                  <p>Closed</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className={styles.faqSection}>
          <h2>Frequently Asked Questions</h2>
          <div className={styles.faqGrid}>
            <div className={styles.faqItem}>
              <h3>How quickly do you respond?</h3>
              <p>We aim to respond to all inquiries within 24 hours during business days.</p>
            </div>
            <div className={styles.faqItem}>
              <h3>Do you offer international shipping?</h3>
              <p>Yes! We ship to most countries worldwide. Contact us for specific rates.</p>
            </div>
            <div className={styles.faqItem}>
              <h3>Can I return parts?</h3>
              <p>We offer a 30-day return policy for unused items in original packaging.</p>
            </div>
            <div className={styles.faqItem}>
              <h3>Do you have a physical store?</h3>
              <p>Yes, visit us at our location in Paramaribo during business hours.</p>
            </div>
          </div>
          <div className={styles.faqCTA}>
            <p>Still have questions?</p>
            <Link href="/faq" className={styles.faqButton}>
              Visit our FAQ Page →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}