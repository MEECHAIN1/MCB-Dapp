// src/pages/OracleChat.tsx
import React, { useState, useEffect } from "react";
import { playConnectSound, playStakeSound } from "@/utils/AudioCelebration";
import { getUserChainFacts } from "@/services/chainFacts";

export default function OracleChat() {
  const [input, setInput] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  const askOracle = async () => {
    setLoading(true);
    playConnectSound(); // 🎶 เสียงเริ่มทำพิธี
    
    const facts = await getUserChainFacts(import.meta.env.VITE_RPC_URL!);
    
    try {
      const response = await fetch("/api/oracle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input, user: facts })
      });
      const data = await response.json();
      setReply(data.text);
      playStakeSound(); // 🎶 เสียงพยากรณ์สำเร็จ
    } catch (err) {
      setReply("กระแสมานาขัดข้อง... โปรดลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 mystical-card mt-10">
      <h2 className="text-2xl font-black text-purple-400 mb-6 flex items-center gap-2">
        🔮 RITUAL ORACLE <span className="text-[10px] bg-purple-500/20 px-2 py-1 rounded text-purple-300">BETA</span>
      </h2>
      
      <div className="space-y-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="ถาม Oracle เกี่ยวกับ Fleet ของท่าน หรือแนวทางการ Ascension..."
          className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm font-mono focus:border-purple-500 outline-none transition-all h-32"
        />
        
        <button
          onClick={askOracle}
          disabled={loading || !input}
          className="btn-ritual w-full !bg-purple-600 hover:!bg-purple-500 shadow-[0_0_20px_rgba(147,51,234,0.3)]"
        >
          {loading ? "กำลังสื่อสารกับ MeeChain..." : "ส่งคำอธิษฐาน ⚡"}
        </button>

        {reply && (
          <div className="mt-8 p-6 bg-zinc-950 border border-purple-500/30 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent animate-scan" />
            <p className="text-xs text-purple-400 mb-2 font-black tracking-widest uppercase">Augury Result:</p>
            <div className="text-sm text-zinc-300 leading-relaxed font-mono">
              <Typewriter text={reply} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Typewriter({ text }: { text: string }) {
  const [current, setCurrent] = useState("");
  useEffect(() => {
    setCurrent("");
    let i = 0;
    const interval = setInterval(() => {
      setCurrent(text.slice(0, i));
      i++;
      if (i > text.length) clearInterval(interval);
    }, 20);
    return () => clearInterval(interval);
  }, [text]);
  return <span>{current}</span>;
}