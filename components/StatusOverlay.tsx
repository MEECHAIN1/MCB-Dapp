
import React, { useEffect } from 'react';
import { useAppState } from '../context/useAppState';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle, CheckCircle2, X } from 'lucide-react';
import confetti from 'canvas-confetti';

export const StatusOverlay: React.FC = () => {
  const { isLoading, error, ritualSuccess, reset } = useAppState();

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
    <div className="fixed bottom-6 right-6 z-[100] pointer-events-none">
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-zinc-900 border border-yellow-500/50 p-4 rounded-xl shadow-2xl flex items-center gap-4 pointer-events-auto"
          >
            <Loader2 className="w-6 h-6 text-yellow-500 animate-spin" />
            <span className="text-white font-mono text-sm uppercase tracking-widest">Performing Ritual...</span>
          </motion.div>
        )}

        {error && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-red-950/80 backdrop-blur-md border border-red-500 p-4 rounded-xl shadow-2xl flex items-center gap-4 pointer-events-auto"
          >
            <AlertCircle className="w-6 h-6 text-red-500" />
            <div className="flex-1">
              <p className="text-white font-bold text-xs uppercase">Ritual Interrupted</p>
              <p className="text-red-200 text-[10px] max-w-[200px] truncate">{error}</p>
            </div>
            <button onClick={reset} className="text-red-400 hover:text-white p-1">
              <X size={16} />
            </button>
          </motion.div>
        )}

        {ritualSuccess && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="bg-green-900 border border-green-500 p-4 rounded-xl shadow-2xl flex items-center gap-4 pointer-events-auto"
          >
            <CheckCircle2 className="w-6 h-6 text-green-400" />
            <span className="text-white font-mono text-sm uppercase tracking-widest">Ritual Successful!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
