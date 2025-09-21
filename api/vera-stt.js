export const config = { api: { bodyParser: { sizeLimit: '15mb' } } };

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const { audio, mime } = req.body || {};
    if (!audio) return res.status(400).json({ error: 'audio base64 required' });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'OPENAI_API_KEY missing' });

    const base64 = audio.includes(',') ? audio.split(',')[1] : audio;
    const buf = Buffer.from(base64, 'base64');
    const filename = 'input.webm';
    const type = mime || 'audio/webm';

    const form = new FormData();
    form.append('file', new Blob([buf], { type }), filename);
    form.append('model', 'whisper-1');
    form.append('temperature', '0');
    form.append('response_format', 'json');

    const r = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}` },
      body: form
    });

    if (!r.ok) {
      const txt = await r.text().catch(()=> '');
      return res.status(r.status).json({ error: 'Whisper error', detail: txt });
    }
    const data = await r.json();
    return res.status(200).json({ text: (data.text || '').trim() });
  } catch (e) {
    return res.status(500).json({ error: 'Server error', detail: e?.message || String(e) });
  }
}
