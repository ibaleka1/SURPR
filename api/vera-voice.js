export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { text } = req.body || {};
    if (!text || typeof text !== 'string') return res.status(400).json({ error: 'Missing "text" string' });

    const apiKey = process.env.ELEVENLABS_API_KEY;
    const voiceId = process.env.ELEVENLABS_VOICE_ID;
    if (!apiKey || !voiceId) return res.status(500).json({ error: 'Voice or API key not configured' });

    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
    const r = await fetch(url, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: { stability: 0.5, similarity_boost: 0.72, style: 0.25, use_speaker_boost: true }
      }),
    });

    if (!r.ok) {
      const detail = await r.text().catch(()=> '');
      return res.status(r.status).json({ error: 'TTS request failed', detail });
    }

    const buf = Buffer.from(await r.arrayBuffer());
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(buf);
  } catch (err) {
    return res.status(500).json({ error: 'Server error', detail: err?.message || String(err) });
  }
}
