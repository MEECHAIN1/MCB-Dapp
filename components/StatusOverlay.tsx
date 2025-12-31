import React, { useEffect } from 'react';
import { useAppState } from '../context/useAppState';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle, CheckCircle2, X, ExternalLink, RefreshCw } from 'lucide-react';
import { useAccount, useChainId } from 'wagmi';
import confetti from 'canvas-confetti';

const getEnvValue = (key: string, fallback: string): string => {
  try {
    const win = window as any;
    if (win.process?.env?.[key]) return win.process.env[key];
  } catch (e) {}
  return fallback;
};

export const StatusOverlay: React.FC = () => {
  const { isLoading, error, ritualSuccess, txHash, reset, handleSwitchNetwork } = useAppState();
  const currentChainId = useChainId();
  const { isConnected } = useAccount();
  
  const targetChainId = Number(getEnvValue('VITE_CHAIN_ID', '56'));
  const explorerUrl = getEnvValue('VITE_EXPLORER_URL', 'https://bscscan.com');

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
            <Loader2 className="w-6 h-6 text-yellow-500 animate-spin" />
            <span className="text-white font-mono text-xs uppercase tracking-[0.2em]">Performing Ritual...</span>
          </motion.div>
        )}

        {(error || (isConnected && currentChainId !== targetChainId)) && (
          <motion.div 
            key="error"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-red-950/80 backdrop-blur-xl border border-red-500/50 p-4 rounded-2xl shadow-2xl flex flex-col gap-3 pointer-events-auto min-w-[300px]"
          >
            <div className="flex items-center gap-4">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <div className="flex-1">
                <p className="text-white font-black text-[10px] uppercase tracking-wider">Ritual Interrupted</p>
                <p className="text-red-200 text-[10px] font-mono opacity-80 max-w-[200px] leading-relaxed">
                  {isConnected && currentChainId !== targetChainId 
                    ? `Dimension Mismatch: Connected to Chain ${currentChainId}, expected ${targetChainId}`
                    : error}
                </p>
              </div>
              <button onClick={reset} className="text-red-400 hover:text-white p-1 transition-colors">
                <X size={14} />
              </button>
            </div>
            
            <button 
              onClick={handleSwitchNetwork}
              className="w-full bg-red-500/20 hover:bg-red-500/40 border border-red-500/50 py-2 rounded-xl flex items-center justify-center gap-2 text-[10px] font-mono text-white uppercase tracking-widest transition-all"
            >
              <RefreshCw size={12} /> Switch to MeeChain
            </button>
          </motion.div>
        )}

        {ritualSuccess && (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="bg-zinc-900/90 backdrop-blur-xl border-2 border-green-500/50 p-5 rounded-2xl shadow-[0_0_40px_rgba(34,197,94,0.2)] flex flex-col gap-3 pointer-events-auto min-w-[280px]"
          >
            <div className="flex items-center gap-4">
              <CheckCircle2 className="w-6 h-6 text-green-400" />
              <div className="flex-1">
                <p className="text-white font-black text-xs uppercase tracking-[0.2em]">🎉 Ritual Success!</p>
              </div>
              <button onClick={reset} className="text-zinc-500 hover:text-white p-1 transition-colors">
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}

        {txHash && !ritualSuccess && !error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900 border border-zinc-700 p-3 rounded-xl pointer-events-auto flex items-center justify-between min-w-[280px]"
          >
            <div className="flex items-center gap-3">
              <Loader2 className="w-4 h-4 text-cyan-500 animate-spin" />
              <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest">Awaiting Verification...</span>
            </div>
            <a 
              href={`${explorerUrl}/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-cyan-400"
            >
              <ExternalLink size={14} />
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};