export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST" });
  }

  try {
    const { prompt, notionKnowledgeBase } = req.body || {};

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Missing prompt" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY not configured" });
    }

    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
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

Provide a helpful answer based on the documentation.`,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await r.json();

    if (!r.ok) {
      return res.status(r.status).json({
        error: "Gemini request failed",
        details: data,
      });
    }

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "No text returned.";

    return res.status(200).json({ text });
  } catch (error) {
    console.error("Gemini API error:", error);
    return res.status(500).json({
      error: "Server error calling Gemini",
      details: error.message,
    });
  }
}
