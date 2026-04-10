import { Router, type IRouter } from "express";
import { GoogleGenAI } from "@google/genai";
import { SummarizeThoughtsBody, AskBrainBody } from "@workspace/api-zod";

const router: IRouter = Router();

if (!process.env.GEMINI_API_KEY) {
  console.error("WARNING: GEMINI_API_KEY is not set");
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY ?? "",
});

const SYSTEM_CONTEXT =
  "You are a personal AI brain. Use ONLY the provided user thoughts to answer questions or summarize. Do not make up information. Keep answers clear and helpful.";

function extractText(response: Awaited<ReturnType<typeof ai.models.generateContent>>): string {
  try {
    // Try the .text getter first (v1.x)
    const t = (response as unknown as { text: unknown }).text;
    if (typeof t === "function") {
      const called = (t as () => string)();
      if (called) return called;
    }
    if (typeof t === "string" && t) return t;
  } catch {
    // ignore
  }

  // Fall back to manual candidate extraction
  try {
    const raw = response as unknown as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
      }>;
    };
    const text = raw.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) return text;
  } catch {
    // ignore
  }

  return "";
}

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
    console.log("Calling Gemini for summarize...");
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
    });

    console.log("Gemini raw response keys:", Object.keys(response ?? {}));

    const result = extractText(response);
    console.log("Extracted result length:", result.length);

    if (!result) {
      res.status(500).json({ error: "AI returned an empty response. Please try again." });
      return;
    }

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
    console.log("Calling Gemini for ask...");
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
    });

    console.log("Gemini raw response keys:", Object.keys(response ?? {}));

    const result = extractText(response);
    console.log("Extracted result length:", result.length);

    if (!result) {
      res.status(500).json({ error: "AI returned an empty response. Please try again." });
      return;
    }

    res.json({ result });
  } catch (err) {
    console.error("Gemini ask error:", err);
    res.status(500).json({ error: "Failed to generate answer. Please try again." });
  }
});

export default router;
