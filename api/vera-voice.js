// api/vera-voice.js
// Vercel Serverless Function (Node.js) to proxy ElevenLabs TTS
// Requires env vars: ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID

export default async function handler(req, res) {
  try {
    // Basic CORS (safe even if same-origin)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Parse body (works whether or not Vercel pre-parses)
    let bodyObj = req.body;
    if (!bodyObj || typeof bodyObj !== 'object') {
      let raw = '';
      for await (const chunk of req) raw += chunk;
      try { bodyObj = JSON.parse(raw || '{}'); } catch { bodyObj = {}; }
    }

    const { text } = bodyObj || {};
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Missing "text" string in body.' });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    const voiceId = process.env.ELEVENLABS_VOICE_ID;

    if (!apiKey || !voiceId) {
      return res.status(500).json({ error: 'Voice or API key not configured.' });
    }

    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

    const elRes = await fetch(url, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg'
      },
      body: JSON.stringify({
        text,
        // Choose the model you prefer:
        // 'eleven_multilingual_v2' is stable & natural, 'eleven_turbo_v2_5' is faster.
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.7,
          style: 0.2,
          use_speaker_boost: true
        }
      })
    });

    if (!elRes.ok) {
      const detail = await elRes.text().catch(() => '');
      return res.status(elRes.status).json({ error: 'TTS request failed', detail });
    }

    const audioBuffer = Buffer.from(await elRes.arrayBuffer());
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(audioBuffer);
  } catch (err) {
    return res.status(500).json({ error: 'Server error', detail: err?.message || String(err) });
  }
}
