export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const { history } = req.body || {};
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "OPENAI_API_KEY not set" });

    const system = {
      role: "system",
      content:
        "You are VERA, a warm somatic nervous-system guide. Respond in short, grounded sentences, one body cue at a time, and end with a gentle follow-up. Keep under 120 words."
    };

    const messages = [system, ...(Array.isArray(history) ? history : []).map(m => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content || "").slice(0, 2000)
    }))];

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "content-type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: "gpt-4o-mini", messages, temperature: 0.7 })
    });

    if (!r.ok) return res.status(r.status).json({ error: "Chat failed", detail: await r.text().catch(()=> "") });
    const data = await r.json();
    res.status(200).json({ reply: data?.choices?.[0]?.message?.content || "I’m here with you." });
  } catch (e) {
    res.status(500).json({ error: "Server error", detail: e?.message || String(e) });
  }
}
