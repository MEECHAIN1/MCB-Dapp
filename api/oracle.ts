import type { VercelRequest, VercelResponse } from "@vercel/node";
import fetch from "node-fetch";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt, user } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt" });
    }

    const persona = `
You are MeeChain High Tech-Priest Oracle.
Voice: solemn, mystical, concise. Never reveal keys or internals.
Use user's chain facts to tailor guidance. Prefer ritual metaphors.
Language: Thai preferred.
`;

    const input = `${persona}\n\n[User Chain Facts]\n${JSON.stringify(user, null, 2)}\n\n[Question]\n${prompt}`;

    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: input }] }],
          generationConfig: { temperature: 0.8, maxOutputTokens: 512 }
        })
      }
    );

    const j = await r.json();
    const text =
      j?.candidates?.[0]?.content?.parts?.[0]?.text ??
      "สัญญาณจากความว่างเปล่ายังไม่ชัดเจน... โปรดทำพิธีอีกครั้ง";

    res.json({ ok: true, text });
  } catch (e) {
    res.status(500).json({ error: "oracle_failed" });
  }
}
