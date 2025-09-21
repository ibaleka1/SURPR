export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const { messages } = req.body || {};
    if (!Array.isArray(messages)) return res.status(400).json({ error: 'messages[] required' });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'OPENAI_API_KEY missing' });

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.7,
        max_tokens: 220,
        messages
      })
    });
    if (!r.ok) {
      const txt = await r.text().catch(() => '');
      return res.status(r.status).json({ error: 'OpenAI error', detail: txt });
    }
    const data = await r.json();
    const text = data?.choices?.[0]?.message?.content?.trim() || "I'm here with you.";
    res.status(200).json({ text });
  } catch (e) {
    res.status(500).json({ error: 'Server error', detail: e?.message || String(e) });
  }
}
