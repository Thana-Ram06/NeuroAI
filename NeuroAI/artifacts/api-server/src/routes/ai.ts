import { Router, type IRouter } from "express";
import OpenAI from "openai";
import { SummarizeThoughtsBody, AskBrainBody } from "@workspace/api-zod";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT =
  "You are a personal AI brain. Use ONLY the provided user thoughts to answer questions or summarize. Do not make up information. Keep answers clear and helpful.";

router.post("/ai/summarize", async (req, res): Promise<void> => {
  const parsed = SummarizeThoughtsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { thoughts } = parsed.data;

  if (thoughts.length === 0) {
    res.status(400).json({ error: "No thoughts to summarize." });
    return;
  }

  const thoughtsText = thoughts
    .map((t, i) => `${i + 1}. ${t.text}`)
    .join("\n");

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Here are my thoughts:\n\n${thoughtsText}\n\nPlease provide a concise summary of these thoughts.`,
        },
      ],
      max_tokens: 500,
    });

    const result = completion.choices[0]?.message?.content ?? "";
    res.json({ result });
  } catch (err) {
    req.log.error({ err }, "OpenAI summarize error");
    res.status(500).json({ error: "Failed to generate summary. Please try again." });
  }
});

router.post("/ai/ask", async (req, res): Promise<void> => {
  const parsed = AskBrainBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { question, thoughts } = parsed.data;

  if (!question.trim()) {
    res.status(400).json({ error: "Question cannot be empty." });
    return;
  }

  if (thoughts.length === 0) {
    res.status(400).json({ error: "No thoughts available to answer from." });
    return;
  }

  const thoughtsText = thoughts
    .map((t, i) => `${i + 1}. ${t.text}`)
    .join("\n");

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Here are my thoughts:\n\n${thoughtsText}\n\nQuestion: ${question}\n\nAnswer based ONLY on the thoughts provided above.`,
        },
      ],
      max_tokens: 500,
    });

    const result = completion.choices[0]?.message?.content ?? "";
    res.json({ result });
  } catch (err) {
    req.log.error({ err }, "OpenAI ask error");
    res.status(500).json({ error: "Failed to generate answer. Please try again." });
  }
});

export default router;
