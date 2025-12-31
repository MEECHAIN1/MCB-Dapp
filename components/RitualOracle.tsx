import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI, Modality } from "@google/genai";
import { Sparkles, Send, X, Shield, Mic, MicOff, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { useAccount, useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import { ADRS, MINIMAL_ERC20_ABI, MINIMAL_NFT_ABI } from '../lib/contracts';
import { useAppState } from '../context/useAppState';

// --- PCM Decoding Helpers (Senior Engineer Implementation) ---
function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
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

const OracleVisualizer = ({ active, mode }: { active: boolean, mode: 'vocalizing' | 'listening' | 'idle' }) => {
  const bars = [...Array(12)];
  let color = 'bg-cyan-500';
  if (mode === 'vocalizing') color = 'bg-purple-500';
  if (mode === 'listening') color = 'bg-red-500';

  return (
    <div className="flex items-center gap-1 h-8 px-4 bg-black/40 rounded-full border border-white/5">
      {bars.map((_, i) => (
        <motion.div
          key={i}
          animate={active ? {
            height: [4, Math.random() * 20 + 8, 4],
            opacity: [0.4, 1, 0.4]
          } : { height: 4, opacity: 0.2 }}
          transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.05 }}
          className={`w-1 rounded-full ${color} shadow-[0_0_10px_rgba(255,255,255,0.1)]`}
        />
      ))}
    </div>
  );
};

export const RitualOracle: React.FC = () => {
  const { language, setError } = useAppState();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'oracle'; text: string }[]>([
    { role: 'oracle', text: language === 'EN' ? "Greetings, Ritualist. The Nexus Oracle is synchronized." : "สวัสดียักเดินทาง ออราเคิลแห่งเน็กซัสซิงโครไนซ์แล้ว" }
  ]);
  
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
        const transcript = e.results[0][0].transcript;
        setInput(transcript);
        handleConsultation(undefined, transcript);
      };
      
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (e: any) => {
        console.error("Speech Recognition Error", e);
        setIsListening(false);
      };
      recognitionRef.current = recognition;
    }
  }, [language]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setError("Speech recognition is unavailable in this browser.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      // Stop any current speaking
      if (currentAudioSource.current) {
        currentAudioSource.current.stop();
        setIsVocalizing(false);
      }
      setInput('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const vocalizeResponse = async (text: string) => {
    if (!speakerEnabled || !text) return;
    
    // Stop previous audio
    if (currentAudioSource.current) {
      currentAudioSource.current.stop();
    }

    setIsVocalizing(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Speak as a mystical tech-priest: ${text}` }] }],
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
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        
        const decoded = decodeBase64(audioData);
        const buffer = await decodeAudioBuffer(decoded, audioContextRef.current);
        const source = audioContextRef.current.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContextRef.current.destination);
        source.onended = () => setIsVocalizing(false);
        currentAudioSource.current = source;
        source.start();
      } else {
        setIsVocalizing(false);
      }
    } catch (err) {
      console.error("TTS failure:", err);
      setIsVocalizing(false);
    }
  };

  const handleConsultation = async (e?: React.FormEvent, overrideInput?: string) => {
    e?.preventDefault();
    const query = (overrideInput || input).trim();
    if (!query || isTyping) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: query }]);
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: query,
        config: {
          systemInstruction: `You are the High Tech-Priest of MeeChain. Speak ritualistically. User metrics: ${stats.mcb} MCB, ${stats.bots} Bots. Language: ${language === 'EN' ? 'English' : 'Thai'}. Keep responses concise but mystical.`,
        },
      });

      const oracleText = response.text || "The Nexus remains silent.";
      setMessages(prev => [...prev, { role: 'oracle', text: oracleText }]);
      await vocalizeResponse(oracleText);
    } catch (err) {
      console.error("Oracle Link Error:", err);
      setMessages(prev => [...prev, { role: 'oracle', text: "Spectral interference detected. Ritual link severed." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-8 z-[60] bg-purple-600 hover:bg-purple-500 text-white p-4 rounded-full shadow-[0_0_40px_rgba(147,51,234,0.5)] transition-all group border border-purple-400/40"
      >
        <Sparkles size={24} className="group-hover:rotate-12" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-purple-500"></span>
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed bottom-24 right-8 z-[70] w-full max-w-sm h-[500px] bg-zinc-950/95 backdrop-blur-3xl border border-purple-500/30 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="p-5 bg-purple-900/20 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield size={18} className="text-purple-400" />
                <h3 className="text-xs font-black uppercase tracking-widest text-white italic">Oracle Nexus</h3>
              </div>
              <div className="flex items-center gap-2">
                <OracleVisualizer active={isVocalizing || isListening} mode={isVocalizing ? 'vocalizing' : isListening ? 'listening' : 'idle'} />
                <button 
                  onClick={() => {
                    setSpeakerEnabled(!speakerEnabled);
                    if (speakerEnabled && currentAudioSource.current) {
                      currentAudioSource.current.stop();
                      setIsVocalizing(false);
                    }
                  }} 
                  className={`p-1.5 rounded-lg transition-colors ${speakerEnabled ? 'text-purple-400 bg-purple-500/10' : 'text-zinc-600 bg-zinc-900'}`}
                >
                  {speakerEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </button>
                <button onClick={() => {
                  setIsOpen(false);
                  if (currentAudioSource.current) currentAudioSource.current.stop();
                }} className="text-zinc-600 hover:text-white p-1.5 transition-colors">
                  <X size={18} />
                </button>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
              {messages.map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: msg.role === 'user' ? 10 : -10 }} animate={{ opacity: 1, x: 0 }} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-[11px] leading-relaxed ${msg.role === 'user' ? 'bg-zinc-900 text-zinc-300' : 'bg-purple-900/20 text-purple-100 border border-purple-500/10'}`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-purple-900/10 p-3 rounded-2xl flex gap-1.5">
                    <div className="w-1 h-1 bg-purple-500 rounded-full animate-bounce" />
                    <div className="w-1 h-1 bg-purple-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1 h-1 bg-purple-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleConsultation} className="p-4 bg-black/50 border-t border-white/5 flex gap-2">
              <button
                type="button"
                onClick={toggleListening}
                className={`p-3.5 rounded-2xl transition-all ${isListening ? 'bg-red-500 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-zinc-900 text-zinc-500 hover:text-white'}`}
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
              <div className="relative flex-1">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isListening ? "Listening to Ritual..." : "Message Oracle..."}
                  className="w-full bg-zinc-900 border border-white/5 rounded-2xl px-5 py-3.5 text-xs focus:outline-none focus:border-purple-500/40 text-white placeholder:text-zinc-700 font-mono transition-all"
                />
                <button type="submit" disabled={isTyping || !input.trim()} className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-500 disabled:opacity-20 hover:text-purple-400 transition-colors">
                  {isTyping ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};