"use client";
import { useState } from "react";
import styles from "./FAQ.module.css";

export default function FAQ() {
  const faqs = [
    { question: "What times are you guys open?", answer: "We are open from monday till saturday from 7am - 6pm" },
    { question: "What if I don’t know the name of the part I need?", answer: "You can search using your car brand, model, and year or you don’t need to know the part name. Just search your car model like: “Toyota Vitz 2007” and we’ll help you identify it." },
    { question: "Can I return a part if it doesn’t fit?", answer: "Yes, as long as the part is unused and in original condition. Contact us for return instructions." },
    { question: "How do I know the part will fit my car?", answer: "Each part shows the compatible car models. Make sure it matches your vehicle details." },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className={styles.main}>
      <div className={styles.inner}>
        <div className={styles.panel1}>
        <header className={styles.header}>
          <h2 className={styles.title}>Frequently Asked Questions</h2>
          <p className={styles.subtitle}>
            Quick answers about openings, parts and cars.
          </p>
        </header>

        <div className={styles.panel}>
          <div className={styles.grid}>
            {faqs.map((faq, i) => {
              const open = openIndex === i;
              return (
                <div
                  key={faq.question}
                  className={`${styles.item} ${open ? styles.itemOpen : ""}`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(open ? null : i)}
                    aria-expanded={open}
                    className={styles.questionButton}
                  >
                    <span className={styles.qText}>{faq.question}</span>

                    <span className={`${styles.caret} ${open ? styles.caretOpen : ""}`}>
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          d="M7 10l5 5 5-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </button>

                  <div className={`${styles.answerWrap} ${open ? styles.answerOpen : ""}`}>
                    <p className={styles.answer}>{faq.answer}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
        <div className={styles.bottomNote}>
          Still unsure? Message us through whatsapp and send us a picture of your car and we can guide you.
        </div>
      </div>
    </section>
  );
}
