
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const StartupLoader: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Initializing Ritual...');

  const messages = [
    'Synchronizing Core Nodes...',
    'Calibrating MCB Flux...',
    'Aligning Cyber-Runes...',
    'Establishing Oracle Link...',
    'Finalizing Ascension Sequence...'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 1200);
          return 100;
        }
        const next = prev + Math.random() * 8;
        const msgIndex = Math.floor((next / 100) * messages.length);
        if (messages[msgIndex]) setLoadingText(messages[msgIndex]);
        return next > 100 ? 100 : next;
      });
    }, 200);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1, ease: "easeInOut" } }}
      className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center p-6 overflow-hidden"
    >
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(197,160,89,0.05),transparent_70%)]" />
      
      <div className="relative mb-16">
        {/* Pulsing Outer Ring */}
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3],
            rotate: [0, 90, 180, 270, 360]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute -inset-12 border border-yellow-500/20 rounded-full"
        />
        <motion.div 
          animate={{ 
            scale: [1.1, 1, 1.1],
            opacity: [0.2, 0.4, 0.2],
            rotate: [360, 270, 180, 90, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -inset-16 border border-yellow-500/10 rounded-full border-dashed"
        />

        {/* Central "M" Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative w-40 h-40 flex items-center justify-center bg-zinc-950 border border-yellow-500/30 rounded-[2rem] shadow-[0_0_80px_rgba(197,160,89,0.2)]"
        >
          {/* Stylized SVG M */}
          <svg viewBox="0 0 100 100" className="w-24 h-24 text-yellow-500 drop-shadow-[0_0_15px_rgba(197,160,89,0.8)]">
            <motion.path
              d="M20 80 V20 L50 50 L80 20 V80"
              fill="none"
              stroke="currentColor"
              strokeWidth="12"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
            {/* Inner glow path */}
            <motion.path
              d="M20 80 V20 L50 50 L80 20 V80"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: [0, 1, 0.5, 1] }}
              transition={{ duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1 }}
            />
          </svg>

          {/* Glitch Overlay Effect */}
          <motion.div 
            animate={{ 
              opacity: [0, 0.2, 0, 0.3, 0],
              x: [0, -2, 2, -1, 0]
            }}
            transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 2 }}
            className="absolute inset-0 bg-cyan-500 mix-blend-overlay rounded-[2rem]"
          />
        </motion.div>
      </div>

      {/* Loading Progress Section */}
      <div className="w-80 space-y-6 relative z-10">
        <div className="flex justify-between items-end px-1">
          <div className="space-y-1">
            <h2 className="text-2xl font-black italic tracking-tighter uppercase text-white leading-none">MeeChain</h2>
            <p className="text-[7px] font-mono text-zinc-500 uppercase tracking-[0.5em]">Network Protocol v3.1.4</p>
          </div>
          <span className="text-sm font-mono text-yellow-500 font-bold tabular-nums">
            {Math.floor(progress).toString().padStart(3, '0')}%
          </span>
        </div>
        
        <div className="h-1.5 bg-zinc-900/50 rounded-full overflow-hidden border border-zinc-800 backdrop-blur-sm relative">
          <motion.div 
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-500 shadow-[0_0_20px_rgba(197,160,89,0.6)] relative"
          >
            {/* Progress Shine */}
            <motion.div 
              animate={{ left: ['-100%', '100%'] }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="absolute top-0 bottom-0 w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
            />
          </motion.div>
        </div>

        <div className="flex flex-col items-center gap-1">
          <p className="text-[9px] font-mono text-zinc-400 uppercase tracking-[0.3em] h-4">
            {loadingText}
          </p>
          <div className="flex gap-1.5 mt-2">
            {[...Array(5)].map((_, i) => (
              <motion.div 
                key={i}
                animate={{ 
                  opacity: progress > (i + 1) * 20 ? 1 : 0.2,
                  scale: progress > (i + 1) * 20 ? [1, 1.2, 1] : 1
                }}
                className="w-1.5 h-1.5 bg-yellow-500 rounded-full"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Background Telemetry Data */}
      <div className="absolute bottom-10 left-10 text-[7px] font-mono text-zinc-800 uppercase tracking-widest leading-relaxed pointer-events-none text-left">
        SYNCING_BLOCK: 14,293,021<br />
        FLUX_CAPACITY: 99.98%<br />
        RITUAL_KEY: 0xMCB_PROTOCOL_ESTABLISHED
      </div>
      <div className="absolute bottom-10 right-10 text-[7px] font-mono text-zinc-800 uppercase tracking-widest leading-relaxed pointer-events-none text-right">
        PEER_NODES: 1,024 ACTIVE<br />
        LATENCY: 4MS<br />
        SECURITY_LEVEL: ASCENSION
      </div>
    </motion.div>
  );
};
