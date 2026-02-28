"use client";
import { useState } from "react";
import styles from "./FAQ.module.css";

export default function FAQ() {
  const faqs = [
    { question: "Wat zijn jullie openingstijden?", answer: "We zijn geopend van maandag tot en met zaterdag van 7.00 tot 18.00 uur." },
    { question: "Wat als ik de naam van het onderdeel dat ik nodig heb niet weet?", answer: "U kunt zoeken op uw automerk, model en bouwjaar, of u hoeft de naam van het onderdeel niet te weten. Onze klantenservice kan u ook helpen bij het vinden van het juiste onderdeel." },
    { question: "Kan ik een onderdeel retourneren als het niet past?", answer: "Ja, zolang het onderdeel ongebruikt en in originele staat is. Neem contact met ons op voor retourinstructies." },
    { question: "Hoe weet ik of het onderdeel op mijn auto past?", answer: "Bij elk onderdeel staan ​​de compatibele automodellen vermeld. Zorg ervoor dat het overeenkomt met de gegevens van uw voertuig." },
];

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className={styles.main}>
      <div className={styles.inner}>
        <div className={styles.panel1}>
        <header className={styles.header}>
          <h2 className={styles.title}>Veelgestelde vragen</h2>
            <p className={styles.subtitle}>
            Snelle antwoorden over openingen, onderdelen en auto's.
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
             <div className={styles.bottomNoteText}>
               <p>
                 Nog steeds niet zeker? 
                 Stuur ons een bericht via WhatsApp met een foto van uw auto, 
                 dan kunnen we u beter adviseren.
               </p>
             </div>

                 <a
                 href="https://wa.me/5978685952"
                 target="_blank"
                 rel="noopener noreferrer"
                 className={styles.whatsappButton}
               >
                 <svg
                   xmlns="http://www.w3.org/2000/svg"
                   viewBox="0 0 32 32"
                   width="20"
                   height="20"
                   fill="currentColor"
                   style={{ marginRight: "8px" }}
                 >
                   <path d="M16.04 3C9.41 3 4 8.41 4 15.04c0 2.65.87 5.1 2.35 7.1L4 29l7.05-2.3c1.94 1.06 4.13 1.62 6.35 1.62 6.63 0 12.04-5.41 12.04-12.04S22.67 3 16.04 3zm6.95 17.36c-.29.82-1.7 1.57-2.35 1.66-.61.09-1.37.13-2.21-.13-.51-.16-1.16-.38-2-.74-3.51-1.52-5.8-5.08-5.97-5.31-.17-.23-1.42-1.89-1.42-3.61s.9-2.57 1.22-2.93c.32-.36.7-.45.94-.45.23 0 .47 0 .68.01.22.01.52-.08.81.61.29.7.99 2.41 1.08 2.59.09.18.15.39.03.62-.12.23-.18.38-.35.59-.17.2-.36.45-.52.6-.17.15-.34.31-.15.61.18.29.8 1.32 1.72 2.14 1.18 1.05 2.18 1.38 2.49 1.53.31.15.49.13.67-.08.18-.2.79-.92 1-1.23.21-.31.41-.26.7-.15.29.1 1.84.87 2.15 1.03.31.15.52.23.6.36.08.13.08.77-.21 1.59z"/>
                 </svg>
                 WhatsApp
               </a>
               </div>


                 </div>
               </section>
             );} 
