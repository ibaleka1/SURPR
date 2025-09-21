export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const { text, voiceId: overrideVoiceId, stylePreset } = req.body || {};
    if (!text || typeof text !== "string") return res.status(400).json({ error: 'Missing "text" string in body.' });

    const apiKey = process.env.ELEVENLABS_API_KEY;
    const envVoiceId = process.env.ELEVENLABS_VOICE_ID;
    const voiceId = overrideVoiceId || envVoiceId;
    if (!apiKey || !voiceId) return res.status(500).json({ error: "Voice or API key not configured." });

    const whispery = { stability: 0.2, similarity_boost: 0.9, style: 0.85, use_speaker_boost: false };
    const chosen = (stylePreset === "default")
      ? { stability: 0.5, similarity_boost: 0.7, style: 0.2, use_speaker_boost: true }
      : whispery;

    const ttsUrl = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
    const r = await fetch(ttsUrl, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "content-type": "application/json",
        "accept": "audio/mpeg"
      },
      body: JSON.stringify({ text, model_id: "eleven_multilingual_v2", voice_settings: chosen })
    });

    if (!r.ok) return res.status(r.status).json({ error: "TTS request failed", detail: await r.text().catch(()=> "") });

    const buf = Buffer.from(await r.arrayBuffer());
    res.setHeader("content-type", "audio/mpeg");
    res.setHeader("cache-control", "no-store");
    res.setHeader("x-voice-id", voiceId);
    res.status(200).send(buf);
  } catch (e) {
    res.status(500).json({ error: "Server error", detail: e?.message || String(e) });
  }
}
