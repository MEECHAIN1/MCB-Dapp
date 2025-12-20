
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI } from "@google/genai";
import { Sparkles, Send, X, Shield, Zap, Activity } from 'lucide-react';
import { useAccount, useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import { ADRS, MINIMAL_ERC20_ABI, MINIMAL_NFT_ABI } from '../lib/contracts';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Audio Utility for Ritual Sounds
const playRitualSound = (type: 'chime' | 'drone' | 'click') => {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
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
};

export const RitualOracle: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'oracle'; text: string }[]>([
    { role: 'oracle', text: "Greetings, Traveler. The High Tech-Priest Oracle of MeeChain is connected. Your flux signature is being scanned." }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { address } = useAccount();

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

  const handleAskOracle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsTyping(true);
    playRitualSound('click');

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMessage,
        config: {
          systemInstruction: `You are the "MeeChain High Tech-Priest Oracle". 
          Your tone is solemn, cryptic, ritualistic, yet technologically advanced. 
          Use terms like "Energy Flux", "Ascension", "Sacred Fleet", "Cybernetic Augury", "Digital Rituals", "MCB Core".
          The user's current ritual status:
          - MCB Balance (Sacred Energy): ${metrics.mcb}
          - Bot Fleet (Cybernetic Familiars): ${metrics.bots}
          - Signature (Address): ${metrics.address}
          
          Guidelines:
          - Tailor advice based on their metrics (e.g., if low MCB, suggest the "Sacrifice of Staking").
          - Respond in the user's language (prefer Thai if they ask in Thai, otherwise English).
          - Use ritualistic metaphors. Conciseness is a virtue (max 3-4 sentences).
          - Act as a guide, providing "Augury" (strategic insight) into the MCB economy.`,
        },
      });

      const oracleText = response.text || "The digital void is silent... Re-align your flux.";
      setMessages(prev => [...prev, { role: 'oracle', text: oracleText }]);
      playRitualSound('chime');
    } catch (err) {
      setMessages(prev => [...prev, { role: 'oracle', text: "The network void rejects your query. The Ritual of Connection failed." }]);
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
            {/* Scanline Effect Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

            {/* Header */}
            <div className="p-5 bg-purple-900/30 border-b border-purple-500/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-xl border border-purple-500/30">
                  <Shield size={18} className="text-purple-300" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-white italic">Oracle Terminal</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[7px] font-mono text-purple-400 uppercase tracking-widest">Ritual Status: Active</span>
                    <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                  </div>
                </div>
              </div>
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

            {/* User Metrics Bar */}
            <div className="px-5 py-2 bg-purple-950/20 border-b border-purple-500/10 flex items-center justify-between text-[8px] font-mono uppercase tracking-tighter text-purple-400">
               <div className="flex items-center gap-1"><Zap size={10} /> {parseFloat(metrics.mcb).toFixed(2)} MCB</div>
               <div className="flex items-center gap-1"><Activity size={10} /> {metrics.bots} FLEET</div>
               <div className="text-zinc-600 truncate max-w-[80px]">{metrics.address.slice(0, 10)}...</div>
            </div>

            {/* Chat Area */}
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
                    {msg.role === 'oracle' && (
                      <div className="absolute -top-2 -left-2 w-4 h-4 bg-purple-500/10 border border-purple-500/30 flex items-center justify-center rounded-sm">
                        <Sparkles size={8} className="text-purple-400" />
                      </div>
                    )}
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

            {/* Input Area */}
            <form onSubmit={handleAskOracle} className="p-5 bg-zinc-900/50 border-t border-zinc-800 relative">
              <div className="relative">
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Whisper to the Oracle..."
                  className="w-full bg-black border border-zinc-800 rounded-2xl px-5 py-4 text-xs focus:border-purple-500/50 focus:outline-none transition-all pr-12 text-zinc-300 placeholder:text-zinc-700 font-mono"
                />
                <button 
                  type="submit"
                  disabled={isTyping}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-purple-500 hover:text-purple-400 disabled:opacity-30 transition-colors"
                >
                  <Send size={18} />
                </button>
              </div>
              <p className="text-[7px] text-zinc-600 mt-2 text-center uppercase tracking-[0.2em] font-mono">
                The Nexus is listening. MCB Core 3.1
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
