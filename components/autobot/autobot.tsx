"use client";

import { useEffect, useRef, useState } from "react";
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

interface ChatSession {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  preview?: string;
}

interface ChatbotApiResponse {
  message: string;
  suggestions?: string[];
  sessionId?: string;
  intent?: "SEARCH" | "RESERVATION" | "GENERAL" | "SMALLTALK";
}

const BOT_AVATAR = "/images/ai-agent.webp";

const INITIAL_SUGGESTIONS = [
  "Remmen vervangen",
  "Olie verversen",
  "Apk keuring",
  "Onderdelen zoeken",
];

const createInitialBotMessage = (): Message => ({
  id: `init_${Date.now()}`,
  text: "Hallo! Ik ben AutoBot, jouw AI-assistent voor auto-onderdelen. Waarmee kan ik je helpen?",
  sender: "bot",
  timestamp: new Date(),
  suggestions: INITIAL_SUGGESTIONS,
});

export default function AutoBot() {
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const inFlightRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);

  const activeMessages = activeChatId ? messages[activeChatId] || [] : [];

  const loadMessages = async (chatId: string) => {
    try {
      const res = await fetch(`/api/chats/${chatId}/messages`, {
        method: "GET",
        cache: "no-store",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || `HTTP_${res.status}`);
      }

      const dbMessages = Array.isArray(data?.messages) ? data.messages : [];

      const mappedMessages: Message[] = dbMessages
        .filter((msg: any) => msg.role === "user" || msg.role === "assistant")
        .map((msg: any) => ({
          id: String(msg.message_id),
          text: msg.content,
          sender: msg.role === "assistant" ? "bot" : "user",
          timestamp: new Date(msg.created_at),
        }));

      setMessages((prev) => ({
        ...prev,
        [chatId]:
          mappedMessages.length > 0 ? mappedMessages : [createInitialBotMessage()],
      }));
    } catch (error) {
      console.error("loadMessages error:", error);

      setMessages((prev) => ({
        ...prev,
        [chatId]: prev[chatId]?.length ? prev[chatId] : [createInitialBotMessage()],
      }));
    }
  };

  const loadChats = async () => {
    try {
      const res = await fetch("/api/chats", {
        method: "GET",
        cache: "no-store",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || `HTTP_${res.status}`);
      }

      const dbChats = Array.isArray(data?.chats) ? data.chats : [];

      const mappedChats: ChatSession[] = dbChats.map((chat: any) => ({
        id: String(chat.chat_id),
        title: chat.title || "Nieuwe chat",
        createdAt: new Date(chat.created_at),
        updatedAt: new Date(chat.updated_at),
        preview: chat.title || "Start een nieuw gesprek...",
      }));

      setChatSessions(mappedChats);

      if (mappedChats.length > 0) {
        setActiveChatId((prev) => prev ?? mappedChats[0].id);
      } else {
        setActiveChatId(null);
      }
    } catch (error) {
      console.error("loadChats error:", error);
    }
  };

  useEffect(() => {
    loadChats();
  }, []);

  useEffect(() => {
    if (!activeChatId) return;
    loadMessages(activeChatId);
  }, [activeChatId]);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [activeMessages, isTyping]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });

  const formatChatDate = (date: Date) =>
    date.toLocaleDateString("nl-NL", { day: "2-digit", month: "2-digit" });

  const addMessageToChat = (chatId: string, msg: Message) => {
    setMessages((prev) => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), msg],
    }));
  };

  const updateChatPreview = (chatId: string, preview: string) => {
    setChatSessions((prev) =>
      prev.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              preview,
              updatedAt: new Date(),
              title:
                chat.title === "Nieuwe chat" || !chat.title
                  ? preview.slice(0, 30)
                  : chat.title,
            }
          : chat
      )
    );
  };

  const createNewChat = async () => {
    try {
      const res = await fetch("/api/chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "Nieuwe chat",
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || `HTTP_${res.status}`);
      }

      const dbChat = data?.chat;

      if (!dbChat?.chat_id) {
        throw new Error("Geen chat_id ontvangen van server.");
      }

      const newChatId = String(dbChat.chat_id);

      const newChat: ChatSession = {
        id: newChatId,
        title: dbChat.title || "Nieuwe chat",
        createdAt: new Date(dbChat.created_at),
        updatedAt: new Date(dbChat.updated_at),
        preview: "Start een nieuw gesprek...",
      };

      setChatSessions((prev) => [newChat, ...prev]);
      setMessages((prev) => ({
        ...prev,
        [newChatId]: [createInitialBotMessage()],
      }));
      setActiveChatId(newChatId);
      setInputMessage("");

      if (typeof window !== "undefined") {
        sessionStorage.removeItem("chatSessionId");
      }

      setTimeout(() => inputRef.current?.focus(), 0);
    } catch (error) {
      console.error("createNewChat error:", error);
      alert("Kon nieuwe chat niet aanmaken.");
    }
  };

  const sendMessage = async (text: string) => {
    const clean = text.trim();
    if (!clean || !activeChatId) return;
    if (inFlightRef.current) return;

    abortRef.current?.abort();
    abortRef.current = new AbortController();
    inFlightRef.current = true;

    const currentChatId = activeChatId;

    const userMessage: Message = {
      id: `${Date.now()}_user`,
      text: clean,
      sender: "user",
      timestamp: new Date(),
    };

    addMessageToChat(currentChatId, userMessage);
    updateChatPreview(currentChatId, clean);
    setInputMessage("");
    setIsTyping(true);

    try {
      const conversationId =
        typeof window !== "undefined"
          ? sessionStorage.getItem("chatSessionId")
          : null;

      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortRef.current.signal,
        body: JSON.stringify({
          message: clean,
          conversationId,
          localChatId: currentChatId,
        }),
      });

      const data: Partial<ChatbotApiResponse> = await res.json().catch(() => ({}));

      if (!res.ok) {
        const serverMsg = (data?.message || "").toString();
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

      addMessageToChat(currentChatId, botMessage);

      if (data?.sessionId && typeof window !== "undefined") {
        sessionStorage.setItem("chatSessionId", data.sessionId);
      }
    } catch (err: any) {
      if (err?.name === "AbortError") return;

      console.error("AutoBot sendMessage error:", err);

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
          ? "AutoBot is tijdelijk niet beschikbaar. Probeer later opnieuw."
          : "Sorry, er is een verbindingsprobleem. Probeer het later opnieuw.",
        sender: "bot",
        timestamp: new Date(),
        suggestions: isAiDown
          ? ["Probeer opnieuw", "Onderdelen zoeken"]
          : ["Probeer opnieuw"],
      };

      addMessageToChat(currentChatId, botError);
    } finally {
      setIsTyping(false);
      inFlightRef.current = false;
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

        <div className={styles.chatPageLayout}>
          <motion.aside
            className={styles.sidebar}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className={styles.sidebarHeader}>
              <div>
                <h3>Mijn chats</h3>
                <p>Overzicht van gesprekken</p>
              </div>

              <button
                type="button"
                className={styles.newChatButton}
                onClick={createNewChat}
              >
                + Nieuwe chat
              </button>
            </div>

            <div className={styles.chatList}>
              {chatSessions.length === 0 ? (
                <div className={styles.emptyChats}>
                  <p>Nog geen chats aangemaakt.</p>
                  <span>Klik op “Nieuwe chat” om te beginnen.</span>
                </div>
              ) : (
                chatSessions.map((chat) => (
                  <button
                    key={chat.id}
                    type="button"
                    className={`${styles.chatListItem} ${
                      activeChatId === chat.id ? styles.activeChatItem : ""
                    }`}
                    onClick={() => setActiveChatId(chat.id)}
                  >
                    <div className={styles.chatListTop}>
                      <span className={styles.chatListTitle}>{chat.title}</span>
                      <span className={styles.chatListDate}>
                        {formatChatDate(chat.updatedAt)}
                      </span>
                    </div>

                    <p className={styles.chatListPreview}>
                      {chat.preview || "Geen preview beschikbaar"}
                    </p>
                  </button>
                ))
              )}
            </div>
          </motion.aside>

          <div className={styles.mainContent}>
            <div className={styles.chatLayout}>
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

                  {!activeChatId ? (
                    <div className={styles.emptyChatState}>
                      <h3>Start een nieuwe chat</h3>
                      <p>
                        Klik links op “Nieuwe chat” om een gesprek met AutoBot te
                        beginnen.
                      </p>
                    </div>
                  ) : (
                    <div className={styles.chatMessages}>
                      <div
                        ref={scrollContainerRef}
                        className={styles.messagesContainer}
                      >
                        {activeMessages.map((message) => (
                          <motion.div
                            key={message.id}
                            className={`${styles.message} ${styles[message.sender]}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            {message.sender === "bot" && (
                              <div className={styles.botAvatar}>
                                <Image
                                  src={BOT_AVATAR}
                                  alt="Bot"
                                  width={40}
                                  height={40}
                                />
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

                              <span className={styles.timestamp}>
                                {formatTime(message.timestamp)}
                              </span>
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
                              <Image
                                src={BOT_AVATAR}
                                alt="Bot"
                                width={30}
                                height={30}
                              />
                            </div>
                            <div className={styles.typingIndicator}>
                              <span></span>
                              <span></span>
                              <span></span>
                            </div>
                          </motion.div>
                        )}
                      </div>

                      <form
                        onSubmit={handleSendMessage}
                        className={styles.chatInputForm}
                      >
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
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}