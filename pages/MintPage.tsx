
import React, { useState } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { ADRS, MINIMAL_NFT_ABI } from '../lib/contracts';
import { useAppState } from '../context/useAppState';
import { motion, AnimatePresence } from 'framer-motion';
import { Hammer, Sparkles, Cpu, Shield, Zap, Loader2, CheckCircle2, Terminal, Activity } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

interface BotSoul {
  name: string;
  class: string;
  bio: string;
  power: number;
}

const MintPage: React.FC = () => {
  const { address } = useAccount();
  const { executeRitual, language, isLoading } = useAppState();
  const [soul, setSoul] = useState<BotSoul | null>(null);
  const [ritualStep, setRitualStep] = useState<'idle' | 'consulting' | 'soul-bound' | 'forging' | 'completed'>('idle');

  const { writeContractAsync } = useWriteContract();

  const generateSoul = async () => {
    setRitualStep('consulting');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "Forge a unique cyber-bot profile for the MeeChain Ritual. Provide a cryptic name, an arcane class (e.g. Chronos-Wraith, Void-Stalker, Nexus-Anchor, Binary-Lich), an evocative and mysterious bio steeped in techno-ritualistic lore (mentioning circuits, souls, cosmic flux, or forbidden silicon rituals), and a power level (1-100). Respond in JSON format.",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { 
                type: Type.STRING,
                description: "A cryptic, high-tech name for the entity."
              },
              class: { 
                type: Type.STRING,
                description: "An arcane cybernetic class name."
              },
              bio: { 
                type: Type.STRING,
                description: "A mysterious and evocative ritualistic biography."
              },
              power: { 
                type: Type.NUMBER,
                description: "Numerical representation of flux capacity (1-100)."
              }
            },
            required: ["name", "class", "bio", "power"]
          }
        }
      });

      const data = JSON.parse(response.text || '{}');
      setSoul(data);
      setRitualStep('soul-bound');
    } catch (err: any) {
      console.error("Soul generation failed:", err);
      setRitualStep('idle');
    }
  };

  const forgeBot = async () => {
    if (!address || !soul) return;
    setRitualStep('forging');
    
    try {
      const metadataUri = `data:application/json;base64,${btoa(JSON.stringify(soul))}`;
      await executeRitual(
        async () => {
          return await writeContractAsync({
            address: ADRS.nft as `0x${string}`,
            abi: MINIMAL_NFT_ABI,
            functionName: 'safeMint',
            args: [address, metadataUri],
          });
        },
        { 
          to: ADRS.nft as `0x${string}`, 
          data: undefined // safeMint call data estimated inside
        }
      );
      setRitualStep('completed');
    } catch (err: any) {
      setRitualStep('soul-bound');
    }
  };

  const t = {
    EN: {
      title: "The Cyber Forge",
      subtitle: "Summon a unique MCB-Bot into your fleet",
      consult: "Consult the Oracle",
      consultDesc: "Use Gemini AI to generate a bot soul",
      forge: "Forge Unit on MeeChain",
      forgeDesc: "Commit the ritual to the blockchain",
      status: "Forge Status",
      idle: "Waiting for initiation...",
      consulting: "Oracle is calculating spiritual coordinates...",
      soulBound: "Soul Bound! Ready to materialize.",
      forging: "Synchronizing with MeeChain nodes...",
      completed: "Ritual Complete. Unit Added to Fleet."
    },
    TH: {
      title: "โรงตีเหล็กไซเบอร์",
      subtitle: "อัญเชิญ MCB-Bot ที่ไม่ซ้ำใครเข้าสู่กองทัพของคุณ",
      consult: "ปรึกษาออราเคิล",
      consultDesc: "ใช้ Gemini AI เพื่อสร้างวิญญาณของหุ่นยนต์",
      forge: "หลอมยูนิตบน MeeChain",
      forgeDesc: "บันทึกพิธีกรรมลงในบล็อกเชน",
      status: "สถานะการหลอม",
      idle: "กำลังรอการเริ่มต้น...",
      consulting: "ออราเคิลกำลังคำนวณพิกัดทางวิญญาณ...",
      soulBound: "วิญญาณผูกมัดแล้ว! พร้อมสำหรับการสร้างร่าง",
      forging: "กำลังซิงโครไนซ์กับโหนด MeeChain...",
      completed: "พิธีกรรมเสร็จสมบูรณ์ ยูนิตถูกเพิ่มเข้าสู่กองทัพแล้ว"
    }
  }[language];

  const isGenerating = ritualStep === 'consulting';

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-24 relative">
      <header className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto border border-yellow-500/30"
        >
          <Hammer className="text-yellow-500" size={32} />
        </motion.div>
        <h1 className="text-6xl font-black italic uppercase tracking-tighter text-white">{t.title}</h1>
        <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.4em]">{t.subtitle}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div className={`p-8 rounded-[2.5rem] border transition-all ${ritualStep === 'idle' || ritualStep === 'consulting' ? 'bg-zinc-900 border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.1)]' : 'bg-zinc-950 border-zinc-800 opacity-50'}`}>
            <div className="flex items-start gap-6">
              <div className="p-4 bg-yellow-500/20 rounded-2xl">
                <Sparkles className="text-yellow-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold uppercase italic text-white">{t.consult}</h3>
                <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest mt-1">{t.consultDesc}</p>
                <button
                  onClick={generateSoul}
                  disabled={isGenerating || ritualStep !== 'idle'}
                  className="mt-6 w-full bg-yellow-500 text-black py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-yellow-400 transition-all disabled:opacity-30 flex items-center justify-center gap-3"
                >
                  {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
                  {isGenerating ? "Consulting..." : "Invoke Oracle"}
                </button>
              </div>
            </div>
          </div>

          <div className={`p-8 rounded-[2.5rem] border transition-all ${ritualStep === 'soul-bound' || ritualStep === 'forging' ? 'bg-zinc-900 border-indigo-500/50 shadow-[0_0_30px_rgba(79,70,229,0.1)]' : 'bg-zinc-950 border-zinc-800 opacity-50'}`}>
            <div className="flex items-start gap-6">
              <div className="p-4 bg-indigo-500/20 rounded-2xl">
                <Cpu className="text-indigo-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold uppercase italic text-white">{t.forge}</h3>
                <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest mt-1">{t.forgeDesc}</p>
                <button
                  onClick={forgeBot}
                  disabled={ritualStep !== 'soul-bound' || isLoading}
                  className="mt-6 w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-500 transition-all disabled:opacity-30 flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(79,70,229,0.3)]"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Shield size={20} />}
                  {isLoading ? "Forging..." : "Commit Ritual"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="relative">
          <AnimatePresence mode="wait">
            {soul ? (
              <motion.div
                key="soul-card"
                initial={{ opacity: 0, scale: 0.9, rotateY: 90 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                className="bg-zinc-900/50 border border-zinc-800 rounded-[3rem] p-10 h-full flex flex-col justify-between relative overflow-hidden backdrop-blur-xl group"
              >
                <div className="absolute top-0 right-0 p-8">
                  <span className="text-zinc-800 font-black text-6xl uppercase italic select-none">{soul.class}</span>
                </div>
                
                <div className="relative z-10 space-y-8">
                  <div className="space-y-2">
                    <p className="text-yellow-500 font-mono text-[10px] uppercase tracking-[0.4em]">Designation Established</p>
                    <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter">{soul.name}</h2>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/50 p-4 rounded-2xl border border-zinc-800">
                      <p className="text-zinc-500 text-[8px] uppercase tracking-widest mb-1">Combat Class</p>
                      <p className="text-white font-bold uppercase italic">{soul.class}</p>
                    </div>
                    <div className="bg-black/50 p-4 rounded-2xl border border-zinc-800">
                      <p className="text-zinc-500 text-[8px] uppercase tracking-widest mb-1">Power Level</p>
                      <div className="flex items-center gap-2">
                        <Zap size={12} className="text-yellow-500" />
                        <p className="text-white font-bold uppercase italic">{soul.power}/100</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-zinc-500 text-[8px] uppercase tracking-widest flex items-center gap-2">
                      <Terminal size={10} /> Bio-Transmission
                    </p>
                    <p className="text-zinc-400 font-mono text-xs leading-relaxed italic border-l-2 border-yellow-500/30 pl-4">
                      "{soul.bio}"
                    </p>
                  </div>
                </div>

                <div className="mt-10 pt-6 border-t border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${ritualStep === 'soul-bound' ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                      {ritualStep === 'soul-bound' ? 'Awaiting Materialization' : 'Forged in MeeChain'}
                    </span>
                  </div>
                  {ritualStep === 'completed' && <CheckCircle2 className="text-green-500" />}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty-forge"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-zinc-950 border-2 border-dashed border-zinc-800 rounded-[3rem] h-full flex flex-col items-center justify-center p-12 text-center space-y-6"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-yellow-500 blur-3xl opacity-5 animate-pulse" />
                  <Hammer size={64} className="text-zinc-900" />
                </div>
                <div className="space-y-2">
                  <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.4em]">The Forge is Cold</p>
                  <p className="text-zinc-700 text-[10px] font-mono uppercase tracking-widest">Invoke the Oracle to initiate the spiritual binding ritual.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="bg-black/80 border border-zinc-800 p-6 rounded-3xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Activity className="text-yellow-500 animate-pulse" size={20} />
          <div>
            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-[0.2em]">{t.status}</p>
            <p className="text-sm font-bold text-white uppercase italic">
              {ritualStep === 'idle' && t.idle}
              {ritualStep === 'consulting' && t.consulting}
              {ritualStep === 'soul-bound' && t.soulBound}
              {ritualStep === 'forging' && t.forging}
              {ritualStep === 'completed' && t.completed}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {['idle', 'consulting', 'soul-bound', 'forging', 'completed'].map((step, idx) => {
            const currentIdx = ['idle', 'consulting', 'soul-bound', 'forging', 'completed'].indexOf(ritualStep);
            return (
              <div 
                key={step} 
                className={`w-3 h-1.5 rounded-full transition-all duration-500 ${idx <= currentIdx ? (idx === 4 ? 'bg-green-500' : 'bg-yellow-500') : 'bg-zinc-800'}`} 
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MintPage;
