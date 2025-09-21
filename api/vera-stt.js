export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }
    const { audio, mime } = req.body || {};
    if (!audio) {
      return res.status(400).json({ error: "Missing base64 audio" });
    }
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "OPENAI_API_KEY not set" });
    }

    const buffer = Buffer.from(audio, "base64");
    const blob = new Blob([buffer], { type: mime || "audio/webm" });
    const form = new FormData();
    form.append("file", blob, "input.webm");

    // Prefer Whisper; if your account supports it, you may switch to gpt-4o-mini-transcribe
    form.append("model", "whisper-1");
    // form.append("model", "gpt-4o-mini-transcribe");

    const r = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form
    });
    if (!r.ok) {
      const detail = await r.text().catch(()=> "");
      return res.status(r.status).json({ error: "STT failed", detail });
    }
    const data = await r.json();
    const text = data?.text || "";
    return res.status(200).json({ text });
  } catch (e) {
    return res.status(500).json({ error: "Server error", detail: e?.message || String(e) });
  }
}
