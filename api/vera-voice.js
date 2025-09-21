export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { text } = req.body || {};
    if (!text || typeof text !== 'string') return res.status(400).json({ error: 'text required' });

    const apiKey = process.env.ELEVENLABS_API_KEY;
    const voiceId = process.env.ELEVENLABS_VOICE_ID;
    if (!apiKey || !voiceId) return res.status(500).json({ error: 'Missing ElevenLabs envs' });

    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0.35, use_speaker_boost: true }
      })
    });
    if (!r.ok) {
      const err = await r.text().catch(()=> '');
      return res.status(r.status).json({ error: 'TTS request failed', detail: err });
    }
    const buf = Buffer.from(await r.arrayBuffer());
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(buf);
  } catch (e) {
    return res.status(500).json({ error: 'Server error', detail: e?.message || String(e) });
  }
}
