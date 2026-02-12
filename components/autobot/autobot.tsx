"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./autobot.module.css";
import Image from "next/image";
import { motion } from "framer-motion";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  suggestions?: string[];
}

export default function AutoBot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hallo! Ik ben AutoBot, jouw AI-assistent voor auto-onderdelen. Waarmee kan ik je helpen?",
      sender: "bot",
      timestamp: new Date(),
      suggestions: ["Remmen vervangen", "Olie verversen", "Apk keuring", "Onderdelen zoeken"]
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll naar nieuwste bericht
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus op input bij laden
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: inputMessage,
          conversationId: sessionStorage.getItem('chatSessionId') 
        }),
      });

      if (!response.ok) throw new Error('Network response was not ok');
      
      const data = await response.json();
      
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: data.message,
        sender: "bot",
        timestamp: new Date(),
        suggestions: data.suggestions,
      };
      
      setMessages((prev) => [...prev, botResponse]);
      
      if (data.sessionId) {
        sessionStorage.setItem('chatSessionId', data.sessionId);
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, er is een verbindingsprobleem. Probeer het later opnieuw.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
    setTimeout(() => {
      const form = document.querySelector('form');
      if (form) form.dispatchEvent(new Event('submit', { cancelable: true }));
    }, 100);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
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
                src="/images/ai-agent.webp" 
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

          {/* Chatbox - rechterkant - ALTIJD OPEN */}
          <motion.div 
            className={styles.chatColumn}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className={styles.chatContainer}>
              {/* Chat Header  */}
              <div className={styles.chatHeader}>
                <div className={styles.chatHeaderInfo}>
                  <h3>AutoBot Assistent</h3>
                  <p>AI-gestuurde onderdelenspecialist</p>
                </div>
                <div className={styles.headerBadge}>
                  <span className={styles.headerDot} /> Actief
                </div>
              </div>

              {/* Chat Messages - ALTIJD ZICHTBAAR */}
              <div className={styles.chatMessages}>
                <div className={styles.messagesContainer}>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      className={`${styles.message} ${styles[message.sender]}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {message.sender === 'bot' && (
                        <div className={styles.botAvatar}>
                          <Image 
                            src="/images/ai-agent.webp" 
                            alt="Bot"
                            width={40}
                            height={40}
                          />
                        </div>
                      )}
                      <div className={styles.messageContent}>
                        <div className={styles.messageText}>
                          {message.text}
                        </div>
                        {message.suggestions && message.sender === 'bot' && (
                          <div className={styles.suggestions}>
                            {message.suggestions.map((suggestion, index) => (
                              <button
                                key={index}
                                className={styles.suggestionButton}
                                onClick={() => handleSuggestionClick(suggestion)}
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
                          src="/images/ai-agent-small.webp" 
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
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Input */}
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
                      <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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