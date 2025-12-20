
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';

export const StartupLoader: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Initializing Ritual...');

  const messages = [
    'Synchronizing Node...',
    'Calibrating Flux...',
    'Aligning Cyber-Runes...',
    'Establishing Oracle Link...',
    'Finalizing Ascension...'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 800);
          return 100;
        }
        const next = prev + Math.random() * 15;
        const msgIndex = Math.floor((next / 100) * messages.length);
        if (messages[msgIndex]) setLoadingText(messages[msgIndex]);
        return next > 100 ? 100 : next;
      });
    }, 300);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <motion.div 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center p-6"
    >
      <div className="relative">
        {/* Glowing Background */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-yellow-500 blur-[100px] rounded-full"
        />

        {/* Central Logo "M" stylized using Zap */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative w-32 h-32 flex items-center justify-center bg-zinc-950 border-4 border-yellow-500 rounded-3xl shadow-[0_0_50px_rgba(234,179,8,0.3)] mb-12 overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.1),transparent)]" />
          <Zap size={64} fill="#C5A059" className="text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.8)]" />
          
          {/* Animated Scanline within the logo */}
          <motion.div 
            animate={{ top: ['-100%', '200%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-[2px] bg-white opacity-20 z-10"
          />
        </motion.div>
      </div>

      <div className="w-64 space-y-4">
        <div className="flex justify-between items-end">
          <h2 className="text-xl font-black italic tracking-tighter uppercase text-white">MeeChain</h2>
          <span className="text-[10px] font-mono text-yellow-500 font-bold">{Math.floor(progress)}%</span>
        </div>
        
        <div className="h-1 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
          <motion.div 
            animate={{ width: `${progress}%` }}
            className="h-full bg-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.5)]"
          />
        </div>

        <p className="text-[8px] font-mono text-zinc-500 uppercase tracking-[0.4em] text-center animate-pulse">
          {loadingText}
        </p>
      </div>

      {/* Decorative Hud Elements */}
      <div className="absolute bottom-10 text-[7px] font-mono text-zinc-700 uppercase tracking-widest text-center max-w-xs leading-relaxed">
        System Protocol v3.1.4<br />
        Encrypted Ritual Channel: Active<br />
        Quantum Flux Integrity: 0x99A...FF
      </div>
    </motion.div>
  );
};
