"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./autobot.module.css";
import Image from "next/image";
import { motion } from "framer-motion";

type Sender = "user" | "bot";

interface Message {
  id: string;
  text: string;
  sender: Sender;
  timestamp: Date;
  suggestions?: string[];
}

interface ChatbotApiResponse {
  message: string;
  suggestions?: string[];
  sessionId?: string;
  intent?: "SEARCH" | "RESERVATION" | "GENERAL" | "SMALLTALK";
}

const BOT_AVATAR = "/images/ai-agent.webp";

const INITIAL_SUGGESTIONS = ["Remmen vervangen", "Olie verversen", "Apk keuring", "Onderdelen zoeken"];

export default function AutoBot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      text: "Hallo! Ik ben AutoBot, jouw AI-assistent voor auto-onderdelen. Waarmee kan ik je helpen?",
      sender: "bot",
      timestamp: new Date(),
      suggestions: INITIAL_SUGGESTIONS,
    },
  ]);

  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Prevent double-send & handle request cancelation
  const inFlightRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);

  const chatSessionId = useMemo(() => {
    // sessionStorage exists only client-side (this is a client component)
    return typeof window !== "undefined" ? sessionStorage.getItem("chatSessionId") : null;
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, isTyping]);

  useEffect(() => {
    // Cleanup: abort request if component unmounts
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });

  const addMessage = (msg: Message) => setMessages((prev) => [...prev, msg]);

  const sendMessage = async (text: string) => {
    const clean = text.trim();
    if (!clean) return;
    if (inFlightRef.current) return; // avoid accidental double-send

    // Abort any previous request (optional: keep, helps if user spams)
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    inFlightRef.current = true;

    const userMessage: Message = {
      id: `${Date.now()}_user`,
      text: clean,
      sender: "user",
      timestamp: new Date(),
    };

    addMessage(userMessage);
    setInputMessage("");
    setIsTyping(true);

    try {
      const conversationId =
        typeof window !== "undefined" ? sessionStorage.getItem("chatSessionId") : null;

      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortRef.current.signal,
        body: JSON.stringify({
          message: clean,
          conversationId,
        }),
      });

      // Always try to read JSON (even on errors), so we keep server error codes/messages
      const data: Partial<ChatbotApiResponse> = await res.json().catch(() => ({}));

      if (!res.ok) {
        const serverMsg = (data?.message || "").toString();
        // Keep the actual server message in the thrown error so catch can decide what to show
        throw new Error(serverMsg || `HTTP_${res.status}`);
      }

      const botText = (data?.message || "").toString().trim();

      const botMessage: Message = {
        id: `${Date.now()}_bot`,
        text: botText.length ? botText : "Ik kon geen antwoord genereren.",
        sender: "bot",
        timestamp: new Date(),
        suggestions: data?.suggestions,
      };

      addMessage(botMessage);

      if (data?.sessionId && typeof window !== "undefined") {
        sessionStorage.setItem("chatSessionId", data.sessionId);
      }
    } catch (err: any) {
      // If aborted, silently stop (no error bubble)
      if (err?.name === "AbortError") {
        return;
      }

      console.error("❌ AutoBot sendMessage error:", err);

      const msg = String(err?.message || "");

      const isAiDown =
        msg.includes("AI_SERVICE_DOWN") ||
        msg.includes("HTTP_503") ||
        msg.toLowerCase().includes("quota") ||
        msg.toLowerCase().includes("unauthorized") ||
        msg.toLowerCase().includes("api key");

      const botError: Message = {
        id: `${Date.now()}_bot_error`,
        text: isAiDown
          ? "🚨 AutoBot is tijdelijk niet beschikbaar. Probeer later opnieuw."
          : "Sorry, er is een verbindingsprobleem. Probeer het later opnieuw.",
        sender: "bot",
        timestamp: new Date(),
        suggestions: isAiDown ? ["Probeer opnieuw", "Onderdelen zoeken"] : ["Probeer opnieuw"],
      };

      addMessage(botError);
    } finally {
      setIsTyping(false);
      inFlightRef.current = false;
      // Refocus input
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendMessage(inputMessage);
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  return (
    <section className={styles.autobot}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Praat met AutoBot</h1>
          <p>Zoek onderdelen, krijg advies of maak een afspraak</p>
        </div>

        <div className={styles.chatLayout}>
          {/* Robot afbeelding - linkerkant */}
          <motion.div
            className={styles.robotColumn}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className={styles.robotWrapper}>
              <Image
                src={BOT_AVATAR}
                alt="AutoBot AI Robot"
                width={400}
                height={400}
                className={styles.robotImage}
                priority
              />
              <div className={styles.robotStatus}>
                <span className={styles.statusDot} />
                Online
              </div>
            </div>
          </motion.div>

          {/* Chatbox - rechterkant */}
          <motion.div
            className={styles.chatColumn}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className={styles.chatContainer}>
              <div className={styles.chatHeader}>
                <div className={styles.chatHeaderInfo}>
                  <h3>AutoBot Assistent</h3>
                  <p>AI-gestuurde onderdelenspecialist</p>
                </div>
                <div className={styles.headerBadge}>
                  <span className={styles.headerDot} /> Actief
                </div>
              </div>

              <div className={styles.chatMessages}>
                <div ref={scrollContainerRef} className={styles.messagesContainer}>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      className={`${styles.message} ${styles[message.sender]}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {message.sender === "bot" && (
                        <div className={styles.botAvatar}>
                          <Image src={BOT_AVATAR} alt="Bot" width={40} height={40} />
                        </div>
                      )}

                      <div className={styles.messageContent}>
                        <div className={styles.messageText}>{message.text}</div>

                        {message.suggestions && message.sender === "bot" && (
                          <div className={styles.suggestions}>
                            {message.suggestions.map((suggestion, index) => (
                              <button
                                key={`${message.id}_s_${index}`}
                                type="button"
                                className={styles.suggestionButton}
                                onClick={() => handleSuggestionClick(suggestion)}
                                disabled={isTyping}
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        )}

                        <span className={styles.timestamp}>{formatTime(message.timestamp)}</span>
                      </div>
                    </motion.div>
                  ))}

                  {isTyping && (
                    <motion.div
                      className={`${styles.message} ${styles.bot}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div className={styles.botAvatar}>
                        <Image src={BOT_AVATAR} alt="Bot" width={30} height={30} />
                      </div>
                      <div className={styles.typingIndicator}>
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </motion.div>
                  )}
                </div>

                <form onSubmit={handleSendMessage} className={styles.chatInputForm}>
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Typ je vraag over auto-onderdelen..."
                    className={styles.chatInput}
                    disabled={isTyping}
                  />
                  <button
                    type="submit"
                    className={styles.sendButton}
                    disabled={!inputMessage.trim() || isTyping}
                    aria-label="Verstuur bericht"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M22 2L11 13"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M22 2L15 22L11 13L2 9L22 2Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}