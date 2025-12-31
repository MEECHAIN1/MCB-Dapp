
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppState } from '../context/useAppState';
import { Zap, Loader2, AlertCircle, ExternalLink, Activity, Battery, Cpu } from 'lucide-react';

export default function MiningPage() {
  const { initiateManualRitual, isLoading, error, txHash, language } = useAppState();

  const t = {
    EN: {
      title: "Energy Mine",
      subtitle: "Channel cosmic flux into raw MCB energy",
      buttonIdle: "Initiate Ritual",
      buttonActive: "Channeling...",
      status: "Ritual Status",
      proof: "Ritual Proof",
      stats: "Core Telemetry"
    },
    TH: {
      title: "โรงขุดพลังงาน",
      subtitle: "รวบรวมกระแสพลังงานคอสมิกเป็นพลังงาน MCB บริสุทธิ์",
      buttonIdle: "เริ่มพิธีกรรม",
      buttonActive: "กำลังรวบรวม...",
      status: "สถานะพิธีกรรม",
      proof: "หลักฐานพิธีกรรม",
      stats: "ข้อมูลระบบหลัก"
    }
  }[language];

  const explorerUrl = (import.meta as any).env?.VITE_EXPLORER_URL || 'https://bscscan.com';
  return (
    <div className="max-w-4xl mx-auto space-y-12 py-10 min-h-[70vh] flex flex-col justify-center">
      <header className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.1)]"
        >
          <Activity className="text-cyan-400" size={28} />
        </motion.div>
        <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white">{t.title}</h1>
        <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-[0.4em]">{t.subtitle}</p>
      </header>

      <div className="flex flex-col items-center justify-center space-y-12">
        {/* 🔮 Ritual Core (Button) */}
        <div className="relative group">
          <motion.div
            animate={isLoading ? { scale: [1, 1.2, 1], rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-12 bg-cyan-500/20 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity"
          />
          
          <button
            onClick={() => initiateManualRitual()}
            disabled={isLoading}
            className={`relative w-56 h-56 rounded-full border-2 flex flex-col items-center justify-center gap-3 transition-all duration-500 overflow-hidden z-10
              ${isLoading 
                ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500 shadow-[0_0_60px_rgba(234,179,8,0.3)]' 
                : 'border-cyan-500/50 bg-black text-cyan-400 hover:border-cyan-400 hover:shadow-[0_0_60px_rgba(6,182,212,0.4)]'
              }`}
          >
            {/* Pulsing rings inside button */}
            {!isLoading && (
              <motion.div 
                animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0, 0.1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-4 border border-cyan-500/30 rounded-full"
              />
            )}

            {isLoading ? (
              <Loader2 className="animate-spin" size={48} />
            ) : (
              <Zap size={48} className="animate-pulse" />
            )}
            
            <span className="font-black tracking-widest text-[11px] uppercase italic">
              {isLoading ? t.buttonActive : t.buttonIdle}
            </span>

            {/* Simulated charge bar */}
            {isLoading && (
              <motion.div 
                initial={{ height: "0%" }}
                animate={{ height: "100%" }}
                transition={{ duration: 5, ease: "easeInOut" }}
                className="absolute bottom-0 left-0 right-0 bg-yellow-500/10 -z-10"
              />
            )}
          </button>
        </div>

        {/* 📜 Telemetry Feed */}
        <div className="w-full max-w-xl space-y-6">
          <div className="grid grid-cols-2 gap-4">
             <div className="p-5 bg-zinc-900/50 border border-zinc-800 rounded-3xl flex items-center gap-4">
               <Battery className="text-emerald-500" size={20} />
               <div>
                  <p className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest">Core Charge</p>
                  <p className="text-sm font-black text-white uppercase italic">98.4% Flux</p>
               </div>
             </div>
             <div className="p-5 bg-zinc-900/50 border border-zinc-800 rounded-3xl flex items-center gap-4">
               <Cpu className="text-purple-500" size={20} />
               <div>
                  <p className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest">Sync Priority</p>
                  <p className="text-sm font-black text-white uppercase italic">High-Alpha</p>
               </div>
             </div>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                key="error"
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-5 bg-red-500/10 border border-red-500/50 rounded-2xl flex items-center gap-4 text-red-400 text-xs font-mono"
              >
                <AlertCircle size={20} /> 
                <span className="flex-1 uppercase tracking-tight">{error}</span>
              </motion.div>
            )}

            {txHash && (
              <motion.div 
                key="tx"
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 bg-cyan-500/5 border border-cyan-500/20 rounded-[2rem] space-y-4"
              >
                <div className="flex justify-between items-center">
                   <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
                      <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-[0.3em]">{t.proof}</span>
                   </div>
                   <a 
                    href={`${explorerUrl}/tx/${txHash}`}
                    target="_blank" rel="noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-2 group"
                  >
                    <span className="text-[10px] font-mono font-bold tracking-tighter">{txHash.slice(0, 18)}...</span>
                    <ExternalLink size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </a>
                </div>
                <div className="h-[1px] bg-zinc-800 w-full" />
                <div className="flex items-center justify-between text-[9px] font-mono text-zinc-600 uppercase tracking-widest">
                   <span>Transmission Integrity: {isLoading ? 'SYNCING' : '100%'}</span>
                   <span>Timestamp: {new Date().toLocaleTimeString()}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
