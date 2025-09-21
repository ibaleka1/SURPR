export default function handler(req, res) {
  try {
    const hasOpenAI = !!process.env.OPENAI_API_KEY;
    const hasEleven = !!process.env.ELEVENLABS_API_KEY;
    const hasVoice = !!process.env.ELEVENLABS_VOICE_ID;
    res.status(200).json({
      ok: true,
      runtime: process.env.VERCEL ? "vercel" : "node",
      node: process.version,
      env: {
        OPENAI_API_KEY: hasOpenAI,
        ELEVENLABS_API_KEY: hasEleven,
        ELEVENLABS_VOICE_ID: hasVoice
      }
    });
  } catch (e) {
    res.status(500).json({ ok:false, error: e?.message || String(e) });
  }
}
