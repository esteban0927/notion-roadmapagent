export default async function handler(req, res) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "Missing GEMINI_API_KEY" });

  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
  );
  const data = await r.json();
  return res.status(r.status).json(data);
}
