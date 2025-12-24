
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI, Modality } from "@google/genai";
import { Sparkles, Send, X, Shield, Zap, Activity, Mic, MicOff, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { useAccount, useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import { ADRS, MINIMAL_ERC20_ABI, MINIMAL_NFT_ABI } from '../lib/contracts';
import { useAppState } from '../context/useAppState';

// --- Safe Audio Decoding Utilities ---
function decodeBase64(base64: string): Uint8Array {
  if (!base64) return new Uint8Array(0);
  try {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  } catch (e) {
    console.error("Base64 decoding failed:", e);
    return new Uint8Array(0);
  }
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer | null> {
  if (data.length === 0) return null;
  try {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  } catch (e) {
    console.error("Audio conversion failed:", e);
    return null;
  }
}

const playRitualSound = (type: 'chime' | 'drone' | 'click') => {
  try {
    const AudioCtxClass = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtxClass) return;
    
    const ctx = new AudioCtxClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === 'chime') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    } else if (type === 'drone') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(55, ctx.currentTime);
      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
    } else {
      osc.type = 'square';
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.05);
    }

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  } catch (e) {
    // Audio errors are often blocked by browser policy; ignore silently.
  }
};

export const RitualOracle: React.FC = () => {
  const { language, setError } = useAppState();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'oracle'; text: string }[]>([
    { role: 'oracle', text: language === 'EN' ? "Greetings, Traveler. The High Tech-Priest Oracle of MeeChain is connected." : "สวัสดีนักเดินทาง ออราเคิลผู้พิทักษ์เครือข่าย MeeChain เชื่อมต่อแล้ว" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isVocalizing, setIsVocalizing] = useState(false);
  const [speakerEnabled, setSpeakerEnabled] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { address } = useAccount();
  const recognitionRef = useRef<any>(null);

  // On-Chain Context Fetching
  const { data: mcbBalance } = useReadContract({
    address: ADRS.token,
    abi: MINIMAL_ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  const { data: botCount } = useReadContract({
    address: ADRS.nft,
    abi: MINIMAL_NFT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  const metrics = {
    mcb: mcbBalance ? formatUnits(mcbBalance, 18) : "0",
    bots: botCount?.toString() || "0",
    address: address || "Unknown"
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'EN' ? 'en-US' : 'th-TH';

      recognition.onresult = (event: any) => {
        if (event.results && event.results[0] && event.results[0][0]) {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech Recognition Error:", event.error);
        setIsListening(false);
        setError(language === 'EN' ? "Vocal transmission interrupted." : "การรับสัญญาณเสียงขัดข้อง");
      };
      
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, [language, setError]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setError(language === 'EN' ? "Vocal transmission is not supported on this device." : "อุปกรณ์นี้ไม่รองรับการส่งสัญญาณด้วยเสียง");
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    } else {
      try {
        setInput('');
        recognitionRef.current.start();
        setIsListening(true);
        playRitualSound('click');
      } catch (e) {
        console.error("Failed to initiate vocal link:", e);
        setIsListening(false);
      }
    }
  };

  const vocalizeResponse = async (text: string) => {
    if (!speakerEnabled || !text) return;
    setIsVocalizing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Vocalize in a solemn, high-tech ritualistic tone: ${text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: language === 'EN' ? 'Kore' : 'Zephyr' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const AudioCtxClass = (window as any).AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtxClass) throw new Error("AudioContext not supported");

        const audioCtx = new AudioCtxClass({ sampleRate: 24000 });
        const decodedData = decodeBase64(base64Audio);
        const audioBuffer = await decodeAudioData(decodedData, audioCtx, 24000, 1);
        
        if (audioBuffer) {
          const source = audioCtx.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(audioCtx.destination);
          source.onended = () => setIsVocalizing(false);
          source.start();
        } else {
          setIsVocalizing(false);
        }
      } else {
        setIsVocalizing(false);
      }
    } catch (err) {
      console.error("Vocal synthesis failed:", err);
      setIsVocalizing(false);
    }
  };

  const handleAskOracle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsTyping(true);
    playRitualSound('click');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMessage,
        config: {
          systemInstruction: `You are the "MeeChain High Tech-Priest Oracle". Your tone is solemn, cryptic, ritualistic, yet technologically advanced. Respond in ${language === 'EN' ? 'English' : 'Thai'}. Current user metrics: MCB: ${metrics.mcb}, Bots: ${metrics.bots}.`,
        },
      });

      const oracleText = response.text || (language === 'EN' ? "The nexus remains silent." : "เน็กซัสยังคงเงียบงัน");
      setMessages(prev => [...prev, { role: 'oracle', text: oracleText }]);
      playRitualSound('chime');
      
      await vocalizeResponse(oracleText);
    } catch (err: any) {
      console.error("Ritual link error:", err);
      setError(language === 'EN' ? "Oracle connection ritual failed." : "พิธีกรรมเชื่อมต่อออราเคิลล้มเหลว");
      setMessages(prev => [...prev, { role: 'oracle', text: language === 'EN' ? "Connection ritual failed." : "พิธีกรรมเชื่อมต่อล้มเหลว" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <button
        onClick={() => {
          setIsOpen(true);
          playRitualSound('chime');
        }}
        className="fixed bottom-24 right-8 z-[60] bg-purple-600 hover:bg-purple-500 text-white p-4 rounded-full shadow-[0_0_30px_rgba(147,51,234,0.6)] transition-all group border border-purple-400/30"
      >
        <Sparkles size={24} className="group-hover:rotate-12 transition-transform" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-purple-500 border border-white/20"></span>
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-24 right-8 z-[70] w-96 max-h-[550px] bg-zinc-950/90 backdrop-blur-2xl border border-purple-500/40 rounded-[2.5rem] shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col pointer-events-auto"
          >
            <div className="p-5 bg-purple-900/30 border-b border-purple-500/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-xl border border-purple-500/30">
                  <Shield size={18} className="text-purple-300" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-white italic">Oracle Terminal</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[7px] font-mono text-purple-400 uppercase tracking-widest">
                      {language === 'EN' ? 'Link: Online' : 'สถานะ: ออนไลน์'}
                    </span>
                    <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setSpeakerEnabled(!speakerEnabled)}
                  className={`p-2 rounded-lg transition-colors ${speakerEnabled ? 'text-purple-400 bg-purple-500/10' : 'text-zinc-600 bg-zinc-800/50'}`}
                >
                  {speakerEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </button>
                <button 
                  onClick={() => {
                    setIsOpen(false);
                    playRitualSound('drone');
                  }} 
                  className="text-zinc-500 hover:text-white transition-colors bg-white/5 p-1 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="px-5 py-2 bg-purple-950/20 border-b border-purple-500/10 flex items-center justify-between text-[8px] font-mono uppercase tracking-tighter text-purple-400">
               <div className="flex items-center gap-1"><Zap size={10} /> {parseFloat(metrics.mcb).toFixed(2)} MCB</div>
               <div className="flex items-center gap-1"><Activity size={10} /> {metrics.bots} FLEET</div>
               {isVocalizing && (
                 <div className="flex items-center gap-1 text-yellow-500 animate-pulse">
                   <Volume2 size={10} /> VOCALIZING
                 </div>
               )}
            </div>

            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-5 font-mono scrollbar-hide relative"
            >
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-4 rounded-2xl text-[11px] leading-relaxed relative ${
                    msg.role === 'user' 
                    ? 'bg-zinc-900 text-zinc-300 border border-zinc-800' 
                    : 'bg-purple-900/20 text-purple-100 border border-purple-500/20 shadow-[0_0_20px_rgba(147,51,234,0.05)]'
                  }`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                   <div className="bg-purple-900/10 p-4 rounded-2xl border border-purple-500/10 flex gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                   </div>
                </div>
              )}
            </div>

            <form onSubmit={handleAskOracle} className="p-5 bg-zinc-900/50 border-t border-zinc-800 relative">
              <div className="relative flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-4 rounded-2xl transition-all ${isListening ? 'bg-red-500/20 text-red-500 border-red-500/30 animate-pulse' : 'bg-zinc-800 text-zinc-400 hover:text-white border-zinc-700'}`}
                >
                  {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
                
                <div className="relative flex-1">
                  <input 
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={isListening ? (language === 'EN' ? "Synchronizing..." : "กำลังฟัง...") : (language === 'EN' ? "Speak to the Oracle..." : "ส่งคำขอกับออราเคิล...")}
                    className="w-full bg-black border border-zinc-800 rounded-2xl px-5 py-4 text-xs focus:border-purple-500/50 focus:outline-none transition-all pr-12 text-zinc-300 placeholder:text-zinc-700 font-mono"
                  />
                  <button 
                    type="submit"
                    disabled={isTyping || !input.trim()}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-purple-500 hover:text-purple-400 disabled:opacity-30 transition-colors"
                  >
                    {isTyping ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
