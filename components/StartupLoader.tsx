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
          // ให้เวลา Animation จบลงนิดหน่อยก่อนเรียก onComplete
          setTimeout(onComplete, 800);
          return 100;
        }
        
        const next = prev + (Math.random() * 12 + 2);
        const safeNext = next > 100 ? 100 : next;
        
        // แก้ไขดัชนีอาร์เรย์ให้ไม่เกินขอบเขต
        const msgIndex = Math.min(
          Math.floor((safeNext / 100) * messages.length),
          messages.length - 1
        );
        
        if (messages[msgIndex]) setLoadingText(messages[msgIndex]);
        return safeNext;
      });
    }, 150);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
      className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center p-6 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(197,160,89,0.08),transparent_70%)]" />
      
      <div className="relative mb-16">
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3],
            rotate: [0, 360]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -inset-16 border border-yellow-500/20 rounded-full"
        />
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative w-40 h-40 flex items-center justify-center bg-zinc-950 border border-yellow-500/30 rounded-[2.5rem] shadow-[0_0_80px_rgba(197,160,89,0.2)]"
        >
          <svg viewBox="0 0 100 100" className="w-24 h-24 text-yellow-500 drop-shadow-[0_0_15px_rgba(197,160,89,0.8)]">
            <motion.path
              d="M20 80 V20 L50 50 L80 20 V80"
              fill="none"
              stroke="currentColor"
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
          </svg>
        </motion.div>
      </div>

      <div className="w-80 space-y-6 relative z-10">
        <div className="flex justify-between items-end px-1">
          <div className="space-y-1">
            <h2 className="text-2xl font-black italic tracking-tighter uppercase text-white leading-none">MeeChain</h2>
            <p className="text-[7px] font-mono text-zinc-500 uppercase tracking-[0.5em]">Protocol v3.1.4</p>
          </div>
          <span className="text-sm font-mono text-yellow-500 font-bold tabular-nums">
            {Math.floor(progress).toString().padStart(3, '0')}%
          </span>
        </div>
        
        <div className="h-1.5 bg-zinc-900/50 rounded-full overflow-hidden border border-zinc-800 backdrop-blur-sm relative">
          <motion.div 
            style={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-500 shadow-[0_0_20px_rgba(197,160,89,0.6)]"
          />
        </div>

        <div className="flex flex-col items-center gap-1">
          <p className="text-[9px] font-mono text-zinc-400 uppercase tracking-[0.3em] h-4">
            {loadingText}
          </p>
        </div>
      </div>
    </motion.div>
  );
};