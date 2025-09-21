// api/vera-chat.js
export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Missing OPENAI_API_KEY env var' });
    }

    const { history = [], input = '' } = req.body || {};
    if (typeof input !== 'string' || !input.trim()) {
      return res.status(400).json({ error: 'Missing input' });
    }

    // Compose chat messages
    const system = `
You are VERA, a tender, somatic nervous-system guide.
Speak in short, warm, body-first cues. Avoid medical claims.
Style: grounded, validating, specific to sensations, 2–5 sentences max.
Offer a single next micro-step, often a subtle movement or breath cue.
    `.trim();

    const messages = [
      { role: 'system', content: system },
      ...history.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: String(m.content || '')
      })),
      { role: 'user', content: input }
    ];

    // Call OpenAI (no SDK required)
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.7,
        messages
      })
    });

    if (!r.ok) {
      const errTxt = await r.text().catch(() => '');
      return res.status(r.status).json({ error: 'OpenAI error', detail: errTxt });
    }

    const data = await r.json();
    const reply = data?.choices?.[0]?.message?.content?.trim() || "I'm here with you.";
    return res.status(200).json({ reply });
  } catch (e) {
    return res.status(500).json({ error: 'Server error', detail: e?.message || String(e) });
  }
}
