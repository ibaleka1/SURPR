// Serverless ElevenLabs TTS proxy (CommonJS for maximum compatibility)
module.exports = async (req, res) => {
  // CORS + preflight (safe for local & prod)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Parse robustly (Vercel sometimes bypasses body parsers)
  let body = req.body;
  if (!body || typeof body !== 'object') {
    let raw = ''; for await (const c of req) raw += c;
    try { body = JSON.parse(raw || '{}'); } catch { body = {}; }
  }
  const text = (body && body.text) || '';
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Missing "text" string in body.' });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID;
  if (!apiKey || !voiceId) {
    return res.status(500).json({ error: 'Voice or API key not configured.' });
  }

  try {
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg'
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: { stability: 0.5, similarity_boost: 0.7, style: 0.2, use_speaker_boost: true }
      })
    });

    if (!r.ok) {
      const detail = await r.text().catch(()=> '');
      return res.status(r.status).json({ error: 'TTS request failed', detail });
    }

    const buf = Buffer.from(await r.arrayBuffer());
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(buf);
  } catch (e) {
    return res.status(500).json({ error: 'Server error', detail: e?.message || String(e) });
  }
};
