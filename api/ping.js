export default function handler(req, res) {
  res.status(200).json({
    ok: true,
    node: process.version,
    env: {
      OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
      ELEVENLABS_API_KEY: !!process.env.ELEVENLABS_API_KEY,
      ELEVENLABS_VOICE_ID: !!process.env.ELEVENLABS_VOICE_ID
    }
  });
}
