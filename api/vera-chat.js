export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }
    const { history } = req.body || {};
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "OPENAI_API_KEY not set" });
    }

    const system = {
      role: "system",
      content:
        "You are VERA, a warm, somatic nervous-system guide. You respond in short, grounded sentences, embodying safety. Avoid generic therapy clichés. Offer one simple bodily cue at a time (micro-movements, breath pacing, orientation cues). Ask a gentle follow-up question to deepen interoception. Keep answers under 120 words."
    };

    const msgs = Array.isArray(history) ? history : [];
    const messages = [system, ...msgs.map(m => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content || "").slice(0, 2000)
    }))];

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.7
      })
    });

    if (!r.ok) {
      const detail = await r.text().catch(()=> "");
      return res.status(r.status).json({ error: "Chat failed", detail });
    }
    const data = await r.json();
    const reply = data?.choices?.[0]?.message?.content || "I’m here with you.";
    return res.status(200).json({ reply });
  } catch (e) {
    return res.status(500).json({ error: "Server error", detail: e?.message || String(e) });
  }
}
