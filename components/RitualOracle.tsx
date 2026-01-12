import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI, Modality } from "@google/genai";
import { Sparkles, Send, X, Shield, Mic, MicOff, Volume2, VolumeX, Loader2, Zap } from 'lucide-react';
import { useAccount, useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import { ADRS, MINIMAL_ERC20_ABI, MINIMAL_NFT_ABI } from '../lib/contracts';
import { useAppState } from '../context/useAppState';

// --- Senior Engineering Audio Utilities ---

function decodeBase64(base64: any): Uint8Array {
  // Defensive check: ensure base64 is treated as a string before atob
  const str = typeof base64 === 'string' ? base64 : String(base64 || '');
  try {
    const binaryString = atob(str);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  } catch (e) {
    console.error("Base64 Ritual Failure:", e);
    return new Uint8Array(0);
  }
}

async function decodeAudioBuffer(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const buffer = ctx.createBuffer(1, dataInt16.length, sampleRate);
  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < dataInt16.length; i++) {
    channelData[i] = dataInt16[i] / 32768.0;
  }
  return buffer;
}

const OracleVisualizer = ({ active, mode }: { active: boolean, mode: 'vocalizing' | 'listening' | 'idle' | 'thinking' }) => {
  const bars = [...Array(16)];
  let color = 'bg-zinc-700';
  let glow = 'shadow-none';

  if (mode === 'vocalizing') {
    color = 'bg-purple-500';
    glow = 'shadow-[0_0_15px_rgba(168,85,247,0.5)]';
  } else if (mode === 'listening') {
    color = 'bg-red-500';
    glow = 'shadow-[0_0_15px_rgba(239,68,68,0.5)]';
  } else if (mode === 'thinking') {
    color = 'bg-yellow-500';
    glow = 'shadow-[0_0_15px_rgba(234,179,8,0.5)]';
  }

  return (
    <div className="flex items-center gap-0.5 h-6 px-3 bg-black/60 rounded-full border border-white/5 backdrop-blur-md">
      {bars.map((_, i) => (
        <motion.div
          key={i}
          animate={active ? {
            height: [2, Math.random() * 16 + 4, 2],
            opacity: [0.3, 1, 0.3]
          } : { height: 2, opacity: 0.1 }}
          transition={{ 
            duration: mode === 'thinking' ? 0.8 : 0.4, 
            repeat: Infinity, 
            delay: i * 0.03 
          }}
          className={`w-0.5 rounded-full ${color} ${glow} transition-colors duration-500`}
        />
      ))}
    </div>
  );
};

export const RitualOracle: React.FC = () => {
  const { language, setError } = useAppState();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'oracle'; text: string }[]>([]);
  
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isVocalizing, setIsVocalizing] = useState(false);
  const [speakerEnabled, setSpeakerEnabled] = useState(true);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentAudioSource = useRef<AudioBufferSourceNode | null>(null);

  const { address } = useAccount();
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

  const stats = {
    mcb: mcbBalance ? formatUnits(mcbBalance, 18) : "0",
    bots: botCount?.toString() || "0"
  };

  const initAudio = useCallback(async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
  }, []);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ 
        role: 'oracle', 
        text: language === 'EN' ? "Greetings, Ritualist. The Nexus Oracle is synchronized." : "สวัสดียักเดินทาง ออราเคิลแห่งเน็กซัสซิงโครไนซ์แล้ว" 
      }]);
    }
  }, [language]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'EN' ? 'en-US' : 'th-TH';
      
      recognition.onresult = (e: any) => {
        const transcript = String(e.results?.[0]?.[0]?.transcript || "");
        if (transcript) {
          setInput(transcript);
          handleConsultation(undefined, transcript);
        }
      };
      
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (e: any) => {
        if (e.error !== 'no-speech') {
          console.error("Speech Recognition Error", e);
        }
        setIsListening(false);
      };
      recognitionRef.current = recognition;
    }
  }, [language]);

  const toggleListening = async () => {
    await initAudio();
    if (!recognitionRef.current) {
      setError(language === 'EN' ? "Voice protocols unavailable." : "ระบบบันทึกเสียงขัดข้อง");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      if (currentAudioSource.current) {
        try { currentAudioSource.current.stop(); } catch(e) {}
        setIsVocalizing(false);
      }
      setInput('');
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        setIsListening(false);
      }
    }
  };

  const vocalizeResponse = async (text: any) => {
    const cleanText = typeof text === 'string' ? text : String(text || "");
    if (!speakerEnabled || !cleanText) return;
    
    if (currentAudioSource.current) {
      try { currentAudioSource.current.stop(); } catch(e) {}
    }

    setIsVocalizing(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Mystical tech-priest voice: ${cleanText}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: language === 'EN' ? 'Kore' : 'Zephyr' },
            },
          },
        },
      });

      const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (audioData) {
        await initAudio();
        const ctx = audioContextRef.current!;
        const decoded = decodeBase64(audioData);
        if (decoded.length === 0) throw new Error("Audio decode ritual failed");
        
        const buffer = await decodeAudioBuffer(decoded, ctx);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.onended = () => setIsVocalizing(false);
        currentAudioSource.current = source;
        source.start();
      } else {
        setIsVocalizing(false);
      }
    } catch (err) {
      setIsVocalizing(false);
    }
  };

  const handleConsultation = async (e?: React.FormEvent, overrideInput?: any) => {
    e?.preventDefault();
    // Guarantee string type before trim()
    const rawInput = overrideInput || input || "";
    const query = (typeof rawInput === 'string' ? rawInput : String(rawInput)).trim();
    
    if (!query || isTyping) return;

    await initAudio();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: query }]);
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: query,
        config: {
          systemInstruction: `You are the High Tech-Priest of MeeChain. Speak ritualistically. User metrics: ${stats.mcb} MCB, ${stats.bots} Bots. Language: ${String(language)}. Keep responses concise but mystical.`,
        },
      });

      const responseText = response.text;
      const oracleText = typeof responseText === 'string' ? responseText : "The Nexus remains silent.";
      
      setMessages(prev => [...prev, { role: 'oracle', text: oracleText }]);
      await vocalizeResponse(oracleText);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'oracle', text: "Spectral interference detected. Ritual link severed." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const closeOracle = () => {
    setIsOpen(false);
    if (currentAudioSource.current) {
      try { currentAudioSource.current.stop(); } catch(e) {}
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e) {}
    }
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-8 z-[60] bg-purple-600 hover:bg-purple-500 text-white p-5 rounded-full shadow-[0_0_50px_rgba(147,51,234,0.6)] transition-all group border border-purple-400/40"
      >
        <Sparkles size={28} className="group-hover:rotate-12 transition-transform" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-purple-500"></span>
        </span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.9, y: 50, filter: 'blur(10px)' }}
            className="fixed bottom-24 right-8 z-[70] w-full max-w-[380px] h-[550px] bg-zinc-950/95 backdrop-blur-3xl border border-purple-500/30 rounded-[3rem] shadow-2xl flex flex-col overflow-hidden ring-1 ring-white/10"
          >
            {/* Header */}
            <div className="p-6 bg-purple-900/20 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30 shadow-inner">
                  <Shield size={18} className="text-purple-400" />
                </div>
                <div>
                  <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-white italic">Nexus Oracle</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <p className="text-[9px] font-mono text-purple-400/60 uppercase tracking-widest">Ritual Sync: v2.5</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <OracleVisualizer 
                  active={isVocalizing || isListening || isTyping} 
                  mode={isVocalizing ? 'vocalizing' : isListening ? 'listening' : isTyping ? 'thinking' : 'idle'} 
                />
                <button 
                  onClick={() => {
                    setSpeakerEnabled(!speakerEnabled);
                    if (speakerEnabled && currentAudioSource.current) {
                      try { currentAudioSource.current.stop(); } catch(e) {}
                      setIsVocalizing(false);
                    }
                  }} 
                  className={`p-2.5 rounded-xl transition-all ${speakerEnabled ? 'text-purple-400 bg-purple-500/10 shadow-inner' : 'text-zinc-600 bg-zinc-900'}`}
                >
                  {speakerEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </button>
                <button onClick={closeOracle} className="text-zinc-600 hover:text-white p-1.5 transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Chat Body */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-5 scroll-smooth custom-scrollbar">
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20, y: 10 }} 
                    animate={{ opacity: 1, x: 0, y: 0 }} 
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] p-4 rounded-2xl text-[12px] leading-relaxed relative shadow-lg ${
                      msg.role === 'user' 
                        ? 'bg-zinc-900 text-zinc-300 rounded-tr-none border border-white/5' 
                        : 'bg-purple-900/20 text-purple-100 border border-purple-500/10 rounded-tl-none backdrop-blur-md'
                    }`}>
                      {msg.text}
                      {msg.role === 'oracle' && isVocalizing && i === messages.length - 1 && (
                        <motion.div 
                          className="absolute -right-1 -top-1 w-2.5 h-2.5 bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.8)]"
                          animate={{ scale: [1, 1.6, 1], opacity: [0.6, 1, 0.6] }}
                          transition={{ repeat: Infinity, duration: 1.2 }}
                        />
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-purple-900/10 p-5 rounded-2xl rounded-tl-none border border-purple-500/10 flex gap-2">
                    <motion.div animate={{ y: [0, -5, 0], scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                    <motion.div animate={{ y: [0, -5, 0], scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }} className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                    <motion.div animate={{ y: [0, -5, 0], scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }} className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                  </div>
                </div>
              )}
            </div>

            {/* Footer / Input */}
            <div className="p-5 bg-black/60 border-t border-white/5 backdrop-blur-xl">
              <form onSubmit={handleConsultation} className="flex gap-3">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.85 }}
                  onClick={toggleListening}
                  className={`p-4 rounded-2xl transition-all shadow-xl ${
                    isListening 
                      ? 'bg-red-500 text-white animate-pulse shadow-[0_0_25px_rgba(239,68,68,0.5)]' 
                      : 'bg-zinc-900 text-zinc-500 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                </motion.button>
                
                <div className="relative flex-1 group">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={isListening ? "Listening to the Cosmos..." : "Transmit Ritual Message..."}
                    className="w-full bg-zinc-900/80 border border-white/5 rounded-2xl px-6 py-4 text-xs focus:outline-none focus:border-purple-500/40 text-white placeholder:text-zinc-700 font-mono transition-all shadow-inner backdrop-blur-md"
                  />
                  <button 
                    type="submit" 
                    disabled={isTyping || !String(input || "").trim()} 
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-500 disabled:opacity-20 hover:text-purple-400 transition-colors p-2"
                  >
                    {isTyping ? <Loader2 size={18} className="animate-spin" /> : <Zap size={20} fill="currentColor" className="drop-shadow-[0_0_10px_rgba(168,85,247,0.4)]" />}
                  </button>
                </div>
              </form>
              
              <div className="mt-4 flex items-center justify-between px-2">
                <div className="flex gap-1.5">
                  {[...Array(4)].map((_, i) => <div key={i} className="w-1 h-1 rounded-full bg-zinc-800" />)}
                </div>
                <p className="text-[8px] font-mono text-zinc-600 uppercase tracking-[0.4em] italic">
                  End-to-End Ritual Cryptography
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};