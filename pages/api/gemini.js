export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });

  try {
    const { prompt, notionKnowledgeBase } = req.body || {};
    if (!prompt) return res.status(400).json({ error: "Missing prompt" });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "GEMINI_API_KEY not configured" });

    const model = "gemini-2.5-flash";

    const instructions = `
You are a website optimization consultant.

Decide if the Notion knowledge base is enough to answer the question.

Return ONLY valid JSON in this exact schema:
{
  "route": "answer" | "handoff",
  "answer": string,
  "handoffPrompt": string,
  "missingInfo": string[]
}

Rules:
- If you can give a useful, accurate answer based on the knowledge base, route="answer".
- If the knowledge base is not enough, route="handoff".
- For route="handoff", include:
  - answer: 1-3 sentences explaining what’s missing
  - handoffPrompt: a high-quality prompt the user can paste into ChatGPT or Gemini
  - missingInfo: what you need from the user to proceed
- Never invent facts. If unsure, choose route="handoff".
- No markdown fences. No extra keys.
`.trim();

    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${instructions}

NOTION KNOWLEDGE BASE:
${notionKnowledgeBase || ""}

USER QUESTION:
${prompt}`,
                },
              ],
            },
          ],
          generationConfig: { temperature: 0.3 },
        }),
      }
    );

    const data = await r.json();
    if (!r.ok) {
      console.error("Gemini request failed:", data);
      return res.status(r.status).json({ error: "Gemini request failed", details: data });
    }

    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch (e) {
      // If Gemini returns non-JSON, fall back to showing it as an answer
      return res.status(200).json({
        route: "answer",
        answer: rawText || "No response returned.",
        handoffPrompt: "",
        missingInfo: [],
      });
    }

    return res.status(200).json(parsed);
  } catch (e) {
    console.error("Server error:", e);
    return res.status(500).json({ error: "Server error", details: String(e) });
  }
}
