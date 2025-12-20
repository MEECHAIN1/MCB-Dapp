
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI } from "@google/genai";
import { Sparkles, Send, X, Bot, MessageSquare, Shield } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useAppState } from '../context/useAppState';

// Fix: Follow guidelines to use process.env.API_KEY directly for client initialization (new GoogleGenAI({ apiKey: process.env.API_KEY }))
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const RitualOracle: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'oracle'; text: string }[]>([
    { role: 'oracle', text: "Greetings, Traveler. I am the MeeChain Oracle. Speak your query into the ether, and the network shall answer." }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { address } = useAccount();

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

    try {
      // Fix: Use ai.models.generateContent with model and contents parameters directly as per guidelines
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMessage,
        config: {
          systemInstruction: `You are the "MeeChain Ritual Oracle", a mystical yet technologically advanced high-priest of a blockchain network called MeeChain. 
          Your tone is cryptic, grand, and ritualistic but helpful. 
          The user is interacting with a DApp for MEE tokens and MEE-Bot NFTs. 
          User address: ${address || 'unknown'}. 
          Always refer to tokens as "Sacred Energy" and NFTs as "Cybernetic Familiars". 
          Keep responses concise (max 3 sentences) and always use a bit of mystical cyber-jargon.`,
        },
      });

      // Fix: Access response.text as a property directly (not a method) to extract string output
      const oracleText = response.text || "The signals are crossed... Try again when the flux stabilizes.";
      setMessages(prev => [...prev, { role: 'oracle', text: oracleText }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'oracle', text: "The network void rejects your request. Ensure your API Ritual is valid." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-8 z-[60] bg-purple-600 hover:bg-purple-500 text-white p-4 rounded-full shadow-[0_0_20px_rgba(147,51,234,0.4)] transition-all group"
      >
        <Sparkles size={24} className="group-hover:rotate-12 transition-transform" />
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-24 right-8 z-[70] w-96 max-h-[500px] bg-zinc-950 border border-purple-500/30 rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col pointer-events-auto"
          >
            {/* Header */}
            <div className="p-4 bg-purple-900/20 border-b border-purple-500/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-600/20 rounded-lg">
                  <Shield size={18} className="text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-white italic">Ritual Oracle</h3>
                  <p className="text-[8px] font-mono text-purple-400 uppercase tracking-widest">Active Link: Gemini-Flash</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Chat Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-4 font-mono scrollbar-hide"
            >
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] p-3 rounded-2xl text-[11px] leading-relaxed ${
                    msg.role === 'user' 
                    ? 'bg-zinc-900 text-zinc-300 border border-zinc-800' 
                    : 'bg-purple-900/30 text-purple-100 border border-purple-500/20'
                  }`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                   <div className="bg-purple-900/20 p-3 rounded-2xl border border-purple-500/10 flex gap-1">
                      <div className="w-1 h-1 bg-purple-500 rounded-full animate-bounce" />
                      <div className="w-1 h-1 bg-purple-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1 h-1 bg-purple-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                   </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleAskOracle} className="p-4 bg-zinc-900/50 border-t border-zinc-800">
              <div className="relative">
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask the Oracle..."
                  className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-xs focus:border-purple-500 focus:outline-none transition-colors pr-12 text-zinc-300"
                />
                <button 
                  type="submit"
                  disabled={isTyping}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-purple-500 hover:text-purple-400 disabled:opacity-30"
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
