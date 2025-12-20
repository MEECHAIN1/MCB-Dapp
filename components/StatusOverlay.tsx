
import React, { useEffect } from 'react';
import { useAppState } from '../context/useAppState';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle, CheckCircle2, X, ExternalLink } from 'lucide-react';
import confetti from 'canvas-confetti';

export const StatusOverlay: React.FC = () => {
  const { isLoading, error, ritualSuccess, txHash, reset } = useAppState();

  // Assuming a default explorer for MeeChain or local development
  const explorerUrl = (import.meta as any).env?.VITE_EXPLORER_URL || 'https://explorer.meechain.io';

  useEffect(() => {
    if (ritualSuccess) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#C5A059', '#FFFFFF', '#000000']
      });
    }
  }, [ritualSuccess]);

  return (
    <div className="fixed bottom-6 right-6 z-[100] pointer-events-none flex flex-col gap-3 items-end">
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div 
            key="loading"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-black/80 backdrop-blur-xl border border-yellow-500/30 p-4 rounded-2xl shadow-[0_0_30px_rgba(234,179,8,0.15)] flex items-center gap-4 pointer-events-auto min-w-[240px]"
          >
            <div className="relative">
               <Loader2 className="w-6 h-6 text-yellow-500 animate-spin" />
               <div className="absolute inset-0 blur-sm text-yellow-500 animate-pulse">
                  <Loader2 className="w-6 h-6" />
               </div>
            </div>
            <span className="text-white font-mono text-xs uppercase tracking-[0.2em]">Performing Ritual...</span>
          </motion.div>
        )}

        {error && (
          <motion.div 
            key="error"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-red-950/80 backdrop-blur-xl border border-red-500/50 p-4 rounded-2xl shadow-2xl flex items-center gap-4 pointer-events-auto min-w-[280px]"
          >
            <AlertCircle className="w-6 h-6 text-red-500" />
            <div className="flex-1">
              <p className="text-white font-black text-[10px] uppercase tracking-wider">Ritual Interrupted</p>
              <p className="text-red-200 text-[10px] font-mono opacity-80 max-w-[180px] truncate">{error}</p>
            </div>
            <button onClick={reset} className="text-red-400 hover:text-white p-1 transition-colors">
              <X size={16} />
            </button>
          </motion.div>
        )}

        {ritualSuccess && (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
            className="bg-zinc-900/90 backdrop-blur-xl border-2 border-green-500/50 p-5 rounded-2xl shadow-[0_0_40px_rgba(34,197,94,0.2)] flex flex-col gap-3 pointer-events-auto min-w-[280px]"
          >
            <div className="flex items-center gap-4">
              <div className="bg-green-500/20 p-2 rounded-full">
                <CheckCircle2 className="w-6 h-6 text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-white font-black text-xs uppercase tracking-[0.2em]">🎉 Ritual Success!</p>
                <p className="text-zinc-500 font-mono text-[9px] uppercase tracking-widest mt-0.5">Energy Synchronized</p>
              </div>
              <button onClick={reset} className="text-zinc-500 hover:text-white p-1 transition-colors">
                <X size={14} />
              </button>
            </div>
            
            {txHash && (
              <a 
                href={`${explorerUrl}/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between bg-black/40 hover:bg-black/60 border border-zinc-800 rounded-xl px-4 py-2 transition-all group"
              >
                <span className="text-[10px] font-mono text-zinc-400 group-hover:text-green-400 uppercase tracking-widest">View Ritual Proof</span>
                <ExternalLink size={12} className="text-zinc-600 group-hover:text-green-400" />
              </a>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
