export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });

  try {
    const { prompt, notionKnowledgeBase } = req.body || {};
    if (!prompt) return res.status(400).json({ error: "Missing prompt" });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "GEMINI_API_KEY not configured" });

    // ✅ Current model name from Gemini API docs
    const model = "gemini-2.5-flash";

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
                  text: `You are a helpful website optimization consultant. Use this documentation to answer:

${notionKnowledgeBase || ""}

Question: ${prompt}

Provide a clear, practical answer.`,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await r.json();

    if (!r.ok) {
      console.error("Gemini request failed:", data);
      return res.status(r.status).json({
        error: "Gemini request failed",
        status: r.status,
        details: data,
        model_used: model,
      });
    }

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response returned.";

    return res.status(200).json({ text, model_used: model });
  } catch (e) {
    console.error("Server error calling Gemini:", e);
    return res.status(500).json({ error: "Server error", details: String(e) });
  }
}
