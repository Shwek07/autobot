import Groq from "groq-sdk";
import { query } from "@/lib/db";

interface BuildUpdatedSummaryParams {
  previousSummary?: string;
  userMessage: string;
  assistantMessage: string;
}

export async function getLatestChatSummary(chatId: number): Promise<string> {
  const result = await query(
    `
    SELECT summary_text
    FROM chat_summaries
    WHERE chat_id = $1
    ORDER BY created_at DESC, chat_summary_id DESC
    LIMIT 1
    `,
    [chatId]
  );

  return String(result.rows[0]?.summary_text || "");
}

export async function saveChatSummary(
  chatId: number,
  summaryText: string
): Promise<void> {
  await query(
    `
    INSERT INTO chat_summaries (chat_id, summary_text)
    VALUES ($1, $2)
    `,
    [chatId, summaryText]
  );
}

export async function buildUpdatedSummary({
  previousSummary = "",
  userMessage,
  assistantMessage,
}: BuildUpdatedSummaryParams): Promise<string> {
  const apiKey = (process.env.GROQ_API_KEY || "").trim();
  const modelName = (process.env.GROQ_MODEL || "llama-3.3-70b-versatile").trim();

  if (!apiKey) {
    const fallbackParts = [
      previousSummary?.trim(),
      `User: ${String(userMessage || "").trim()}`,
      `Assistant: ${String(assistantMessage || "").trim()}`,
    ].filter(Boolean);

    return fallbackParts.join("\n");
  }

  try {
    const client = new Groq({ apiKey });

    const prompt = `
Je bent een samenvattingsmodule voor een chatbot.

Doel:
Werk de bestaande chat summary bij op basis van:
- de vorige summary
- de nieuwe user message
- de nieuwe assistant message

Regels:
- Houd de summary kort, duidelijk en bruikbaar voor vervolgcontext
- Voeg alleen relevante info toe
- Vermijd herhaling
- Schrijf in natuurlijke tekst
- Geen markdown
- Geen opsommingstekens tenzij echt nodig
- Geen JSON tenzij de vorige summary duidelijk JSON is
- Als de vorige summary JSON is, geef dan exact die JSON-structuur terug en werk alleen relevante velden bij
- Als de vorige summary geen JSON is, geef gewone compacte tekst terug

VORIGE SUMMARY:
${previousSummary || "(geen summary)"}

USER MESSAGE:
${userMessage}

ASSISTANT MESSAGE:
${assistantMessage}

Geef alleen de bijgewerkte summary terug.
`.trim();

    const completion = await client.chat.completions.create({
      model: modelName,
      temperature: 0.2,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = completion.choices?.[0]?.message?.content?.trim();

    if (!content) {
      const fallbackParts = [
        previousSummary?.trim(),
        `User: ${String(userMessage || "").trim()}`,
        `Assistant: ${String(assistantMessage || "").trim()}`,
      ].filter(Boolean);

      return fallbackParts.join("\n");
    }

    return content;
  } catch (error) {
    console.error("buildUpdatedSummary error:", error);

    const fallbackParts = [
      previousSummary?.trim(),
      `User: ${String(userMessage || "").trim()}`,
      `Assistant: ${String(assistantMessage || "").trim()}`,
    ].filter(Boolean);

    return fallbackParts.join("\n");
  }
}