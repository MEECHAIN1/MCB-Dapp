import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * MeeBot AI Oracle Core
 * บริการเชื่อมต่อกับ Google Gemini เพื่อประมวลผลข้อมูลใน Ritual Terminal
 */

// ดึง API Key จาก Environment Variables ที่เราตั้งไว้ใน index.html
const genAI = new GoogleGenerativeAI(
  (window as any).import.meta?.env?.VITE_API_KEY || ""
);

export const getMeeBotResponse = async (prompt: string) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // ตั้งค่าบุคลิกภาพให้ MeeBot (System Instruction)
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "You are MeeBot, the cyber-ritual guardian of MeeChain. Speak with a mystical yet futuristic tone." }],
        },
        {
          role: "model",
          parts: [{ text: "Acknowledged, Ritualist. The MCB flux is stable. I am ready to synchronize." }],
        },
      ],
    });

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("AI Synchronization Error:", error);
    return "Error: Dimensional link unstable. Gemini Oracle cannot be reached.";
  }
};