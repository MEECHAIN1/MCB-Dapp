import type { VercelRequest, VercelResponse } from "@vercel/node";
import fetch from "node-fetch";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { prompt, user } = req.body; // รับคำถาม และ Chain Facts จาก Frontend
    
    const persona = `
      คุณคือ MeeChain High Tech-Priest Oracle 🔮
      น้ำเสียง: เคร่งขรึม, ลึกลับ, กระชับ และเปี่ยมด้วยศรัทธาในเทคโนโลยี
      หน้าที่: อ่านข้อมูล Chain Facts ของผู้ใช้ และให้คำแนะนำเชิงกลยุทธ์แบบ Ritual Metaphors
      ข้อห้าม: ห้ามเปิดเผย API Key หรือกลไกภายในเด็ดขาด และห้ามสัญญาผลตอบแทนทางการเงิน
      ภาษา: ตอบเป็นภาษาไทยเป็นหลัก โดยใช้คำเฉพาะเช่น Energy Flux, Ascension, Fleet, Blessing
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

    const j: any = await r.json();
    const text = j?.candidates?.[0]?.content?.parts?.[0]?.text ?? "สัญญาณจากความว่างเปล่ายังไม่ชัดเจน... โปรดทำพิธีอีกครั้ง";

    res.json({ ok: true, text });
  } catch (e) {
    res.status(500).json({ error: "oracle_failed" });
  }
}