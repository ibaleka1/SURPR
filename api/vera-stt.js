export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
    const { audio, mime } = req.body || {};
    if (!audio) return res.status(400).json({ error: "Missing base64 audio" });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "OPENAI_API_KEY not set" });

    const buffer = Buffer.from(audio, "base64");
    const blob = new Blob([buffer], { type: mime || "audio/webm" });

    const form = new FormData();
    form.append("file", blob, "input.webm");
    form.append("model", "whisper-1"); // or gpt-4o-mini-transcribe if enabled

    const r = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form
    });

    if (!r.ok) return res.status(r.status).json({ error: "STT failed", detail: await r.text().catch(()=> "") });
    const data = await r.json();
    res.status(200).json({ text: data?.text || "" });
  } catch (e) {
    res.status(500).json({ error: "Server error", detail: e?.message || String(e) });
  }
}
