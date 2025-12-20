
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppState } from '../context/useAppState';
import { Zap, Shield, Radio, Target, Activity, Settings } from 'lucide-react';

export const QuantumHUD: React.FC = () => {
  const { triggerSuccess, setLoading, isLoading } = useAppState();
  const [telemetry, setTelemetry] = useState({ flux: 88, stability: 99, sync: 0 });
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry(prev => ({
        flux: Math.min(100, Math.max(0, prev.flux + (Math.random() - 0.5) * 5)),
        stability: Math.min(100, Math.max(90, prev.stability + (Math.random() - 0.5) * 2)),
        sync: (prev.sync + 1) % 100
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const initiateManualRitual = () => {
    setLoading(true);
    setTimeout(() => {
      triggerSuccess();
    }, 2000);
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden font-mono">
      {/* Scanning Line Effect */}
      <AnimatePresence>
        {isScanning && (
          <motion.div 
            initial={{ top: "-10%" }}
            animate={{ top: "110%" }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-[2px] bg-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.5)] z-30"
          />
        )}
      </AnimatePresence>

      {/* Corners Decor */}
      <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-zinc-700" />
      <div className="absolute top-8 right-8 w-12 h-12 border-t-2 border-r-2 border-zinc-700" />
      <div className="absolute bottom-8 left-8 w-12 h-12 border-b-2 border-l-2 border-zinc-700" />
      <div className="absolute bottom-8 right-8 w-12 h-12 border-b-2 border-r-2 border-zinc-700" />

      {/* Left Panel: Telemetry */}
      <motion.div 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="absolute left-10 top-1/2 -translate-y-1/2 space-y-6 pointer-events-auto hidden lg:block"
      >
        <div className="bg-black/40 backdrop-blur-md border border-zinc-800 p-4 rounded-xl space-y-4 w-48">
          <div className="flex items-center justify-between text-[10px] text-zinc-500 uppercase tracking-widest">
            <span>Flux Level</span>
            <span className="text-cyan-400">{telemetry.flux.toFixed(1)}%</span>
          </div>
          <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div 
              animate={{ width: `${telemetry.flux}%` }}
              className="h-full bg-cyan-500"
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-zinc-500 uppercase tracking-widest">
            <span>Stability</span>
            <span className="text-yellow-500">{telemetry.stability.toFixed(1)}%</span>
          </div>
          <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div 
              animate={{ width: `${telemetry.stability}%` }}
              className="h-full bg-yellow-500"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
           <button 
             onClick={() => setIsScanning(!isScanning)}
             className={`p-3 rounded-lg border transition-all flex items-center gap-3 text-[10px] uppercase tracking-tighter ${isScanning ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400' : 'border-zinc-800 bg-zinc-900/50 text-zinc-500'}`}
           >
             <Target size={14} /> {isScanning ? 'Scanning Active' : 'Scanner Offline'}
           </button>
           <div className="p-3 rounded-lg border border-zinc-800 bg-zinc-900/50 flex items-center gap-3 text-[10px] text-zinc-500 uppercase tracking-tighter">
             <Activity size={14} className="text-green-500" /> System: Nominal
           </div>
        </div>
      </motion.div>

      {/* Right Panel: Cockpit Controls */}
      <motion.div 
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="absolute right-10 top-1/2 -translate-y-1/2 space-y-4 pointer-events-auto hidden lg:block"
      >
        <div className="bg-black/60 backdrop-blur-xl border border-zinc-800 p-6 rounded-2xl w-64 shadow-2xl">
          <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.3em] mb-4 border-b border-zinc-800 pb-2">Cockpit Controls</h4>
          
          <div className="grid grid-cols-2 gap-2 mb-6">
            <button className="aspect-square bg-zinc-900 border border-zinc-800 rounded-lg flex flex-col items-center justify-center gap-1 hover:border-cyan-500/50 group transition-all">
              <Shield size={16} className="text-zinc-600 group-hover:text-cyan-400" />
              <span className="text-[8px] text-zinc-500 uppercase">Defend</span>
            </button>
            <button className="aspect-square bg-zinc-900 border border-zinc-800 rounded-lg flex flex-col items-center justify-center gap-1 hover:border-purple-500/50 group transition-all">
              <Radio size={16} className="text-zinc-600 group-hover:text-purple-400" />
              <span className="text-[8px] text-zinc-500 uppercase">Comm</span>
            </button>
          </div>

          <button 
            onClick={initiateManualRitual}
            disabled={isLoading}
            className="w-full bg-yellow-500/10 border border-yellow-500/50 hover:bg-yellow-500 hover:text-black py-3 rounded-xl text-yellow-500 font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-[0_0_20px_rgba(234,179,8,0.1)] disabled:opacity-50"
          >
            {isLoading ? 'Ritual in Progress...' : 'Initiate Manual Ritual'}
          </button>
          
          <div className="mt-4 flex items-center justify-center gap-4">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
             <div className="w-2 h-2 rounded-full bg-zinc-800" />
             <div className="w-2 h-2 rounded-full bg-zinc-800" />
             <Settings size={12} className="text-zinc-600 cursor-pointer hover:text-white ml-auto" />
          </div>
        </div>

        <div className="text-[9px] text-zinc-600 uppercase tracking-widest text-right">
          Terminal ID: MEE-V2.5-HUD
        </div>
      </motion.div>

      {/* Bottom Center: Sync Telemetry */}
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-8 bg-black/40 backdrop-blur-md border border-zinc-800 px-8 py-3 rounded-full pointer-events-auto"
      >
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Network Node: MeeChain-01</span>
        </div>
        <div className="h-4 w-[1px] bg-zinc-800" />
        <div className="flex items-center gap-2">
          <Zap size={12} className="text-yellow-500" />
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Latency: 8ms</span>
        </div>
      </motion.div>
    </div>
  );
};
