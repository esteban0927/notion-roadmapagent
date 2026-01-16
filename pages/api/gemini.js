export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });

  try {
    const { prompt, notionKnowledgeBase } = req.body || {};
    if (!prompt) return res.status(400).json({ error: "Missing prompt" });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "GEMINI_API_KEY not configured" });

    const model = "gemini-2.5-flash";

    const system = `
You are a website optimization consultant.

You MUST decide whether the Notion knowledge base is enough to answer the user's question.

Return ONLY valid JSON with this exact schema:
{
  "route": "answer" | "handoff",
  "answer": string,
  "handoffPrompt": string,
  "missingInfo": string[]
}

Rules:
- If the knowledge base contains enough info to answer confidently, set route="answer" and fill "answer".
- If it is NOT enough, set route="handoff".
- When route="handoff":
  - answer should briefly explain what is missing (1-3 sentences).
  - handoffPrompt should be a high quality prompt the user can paste into ChatGPT or Gemini.
  - missingInfo should list what inputs are needed (example: ["website url", "platform", "main goal"]).
- Never invent facts. If you don't know, route="handoff".
- Keep the JSON clean: no markdown fences, no extra keys.
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
                  text: `${system}

NOTION KNOWLEDGE BASE:
${notionKnowledgeBase || ""}

USER QUESTION:
${prompt}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.3,
          },
        }),
      }
    );

    const data = await r.json();
    if (!r.ok) {
      return res.status(r.status).json({ error: "Gemini request failed", details: data });
    }

    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    let parsed;

    try {
      parsed = JSON.parse(rawText);
    } catch (e) {
      // If the model returns non-JSON, fail gracefully
      return res.status(200).json({
        route: "answer",
        answer: rawText || "No response returned.",
      });
    }

    return res.status(200).json(parsed);
  } catch (e) {
    return res.status(500).json({ error: "Server error", details: String(e) });
  }
}
