import { Router, type IRouter } from "express";
import { GoogleGenAI } from "@google/genai";
import { SummarizeThoughtsBody, AskBrainBody } from "@workspace/api-zod";

const router: IRouter = Router();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY ?? "",
});

const SYSTEM_CONTEXT =
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

  const thoughtsText = thoughts.map((t, i) => `${i + 1}. ${t.text}`).join("\n");

  const prompt = `${SYSTEM_CONTEXT}\n\nHere are my thoughts:\n\n${thoughtsText}\n\nPlease provide a concise summary of these thoughts.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
    });

    const result = response.text ?? "";
    res.json({ result });
  } catch (err) {
    console.error("Gemini summarize error:", err);
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

  const thoughtsText = thoughts.map((t, i) => `${i + 1}. ${t.text}`).join("\n");

  const prompt = `${SYSTEM_CONTEXT}\n\nHere are my thoughts:\n\n${thoughtsText}\n\nQuestion: ${question}\n\nAnswer based ONLY on the thoughts provided above.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
    });

    const result = response.text ?? "";
    res.json({ result });
  } catch (err) {
    console.error("Gemini ask error:", err);
    res.status(500).json({ error: "Failed to generate answer. Please try again." });
  }
});

export default router;
