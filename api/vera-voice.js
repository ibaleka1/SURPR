export const config = { runtime: "edge" };

export default async function handler(req) {
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "content-type": "application/json" },
      });
    }

    const { text, voiceId: overrideVoiceId, stylePreset } = await req.json().catch(() => ({}));
    if (!text || typeof text !== "string") {
      return new Response(JSON.stringify({ error: 'Missing "text" string in body.' }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    const envVoiceId = process.env.ELEVENLABS_VOICE_ID; // set to a clearly American voice
    const voiceId = overrideVoiceId || envVoiceId;

    if (!apiKey || !voiceId) {
      return new Response(JSON.stringify({ error: "Voice or API key not configured." }), {
        status: 500,
        headers: { "content-type": "application/json" },
      });
    }

    const whispery = {
      stability: 0.2,
      similarity_boost: 0.9,
      style: 0.85,
      use_speaker_boost: false
    };

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
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: chosen
      })
    });

    if (!r.ok) {
      const detail = await r.text().catch(() => "");
      return new Response(JSON.stringify({ error: "TTS request failed", detail }), {
        status: r.status,
        headers: { "content-type": "application/json" }
      });
    }

    const audio = await r.arrayBuffer();
    return new Response(audio, {
      status: 200,
      headers: {
        "content-type": "audio/mpeg",
        "cache-control": "no-store",
        "x-voice-id": voiceId
      }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Server error", detail: e?.message || String(e) }), {
      status: 500,
      headers: { "content-type": "application/json" }
    });
  }
}
