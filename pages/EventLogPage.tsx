
import React, { useState, useEffect } from 'react';
import { useWatchContractEvent } from 'wagmi';
import { ADRS, MINIMAL_NFT_ABI, MINIMAL_STAKING_ABI } from '../lib/contracts';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Activity, Hash, ArrowRightLeft, ShieldAlert, Cpu } from 'lucide-react';
import { useAppState } from '../context/useAppState';

interface RitualLog {
  id: string;
  type: 'TRANSFER' | 'STAKE' | 'REWARD' | 'UNKNOWN';
  address: string;
  details: string;
  timestamp: string;
  txHash: string;
}

const EventLogPage: React.FC = () => {
  const [logs, setLogs] = useState<RitualLog[]>([]);
  const { setLoading, setError } = useAppState();
  const [isEstablishing, setIsEstablishing] = useState(true);

  // Sync global loading state for log establishment
  useEffect(() => {
    setLoading(isEstablishing);
    const timer = setTimeout(() => {
      setIsEstablishing(false);
      setLoading(false);
    }, 2000); // Simulate initial connection ritual
    return () => clearTimeout(timer);
  }, [isEstablishing, setLoading]);

  // Watch NFT Transfers
  useWatchContractEvent({
    address: ADRS.nft as `0x${string}`,
    abi: MINIMAL_NFT_ABI,
    eventName: 'Transfer',
    onLogs(newLogs) {
      const mapped = newLogs.map(l => ({
        id: l.transactionHash + l.logIndex,
        type: 'TRANSFER' as const,
        address: (l.args as any).to,
        details: `UNIT #${(l.args as any).tokenId} synchronized to new signature`,
        timestamp: new Date().toLocaleTimeString(),
        txHash: l.transactionHash || ''
      }));
      setLogs(prev => [...mapped, ...prev].slice(0, 50));
    }
  });

  // Watch Staking Events
  useWatchContractEvent({
    address: ADRS.staking as `0x${string}`,
    abi: MINIMAL_STAKING_ABI,
    eventName: 'stake' as any,
    onLogs(newLogs) {
      const mapped = newLogs.map(l => ({
        id: l.transactionHash + l.logIndex,
        type: 'STAKE' as const,
        address: (l.args as any).user,
        details: `Sacrifice of ${(l.args as any).amount} MCB processed in core`,
        timestamp: new Date().toLocaleTimeString(),
        txHash: l.transactionHash || ''
      }));
      setLogs(prev => [...mapped, ...prev].slice(0, 50));
    }
  });

  const getIcon = (type: RitualLog['type']) => {
    switch (type) {
      case 'TRANSFER': return <ArrowRightLeft className="text-blue-500" size={16} />;
      case 'STAKE': return <Activity className="text-yellow-500" size={16} />;
      case 'REWARD': return <ShieldAlert className="text-green-500" size={16} />;
      default: return <Hash className="text-zinc-500" size={16} />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white">Nexus Logs</h1>
          <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-[0.4em] mt-2">Historical flux transmission from the core protocols</p>
        </div>
        <div className="flex items-center gap-3 bg-zinc-900 px-6 py-3 rounded-2xl border border-zinc-800">
          <Terminal size={18} className="text-yellow-500" />
          <span className="text-xs font-mono uppercase tracking-widest text-zinc-300">Synchronized</span>
        </div>
      </header>

      <div className="bg-zinc-950 border border-zinc-800 rounded-[2rem] overflow-hidden shadow-2xl min-h-[600px] flex flex-col">
        <div className="grid grid-cols-12 bg-zinc-900/50 p-4 border-b border-zinc-800 text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">
          <div className="col-span-2">Time</div>
          <div className="col-span-2">Protocol</div>
          <div className="col-span-5">Flux Details</div>
          <div className="col-span-3 text-right">Ritual Proof</div>
        </div>

        <div className="flex-1 overflow-y-auto max-h-[700px] p-2 space-y-1">
          <AnimatePresence initial={false}>
            {logs.length > 0 ? (
              logs.map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="grid grid-cols-12 p-4 items-center gap-4 hover:bg-white/5 transition-colors rounded-xl border border-transparent hover:border-zinc-800 group"
                >
                  <div className="col-span-2 text-[11px] font-mono text-zinc-500">[{log.timestamp}]</div>
                  <div className="col-span-2 flex items-center gap-2">
                    {getIcon(log.type)}
                    <span className="text-[10px] font-black uppercase tracking-wider text-white">{log.type}</span>
                  </div>
                  <div className="col-span-5 text-sm font-medium text-zinc-400 group-hover:text-white transition-colors">
                    {log.details}
                  </div>
                  <div className="col-span-3 text-right">
                    <a 
                      href={`https://explorer.meechain.io/tx/${log.txHash}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-[10px] font-mono text-zinc-600 hover:text-yellow-500 transition-colors uppercase"
                    >
                      {log.txHash.slice(0, 10)}...
                    </a>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-40 text-center space-y-6 opacity-30">
                <div className="relative">
                  <Cpu size={64} className="text-zinc-700 animate-pulse" />
                  <div className="absolute inset-0 bg-yellow-500 blur-3xl opacity-10 animate-pulse" />
                </div>
                <div>
                  <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.3em]">Establishing Core Connection...</p>
                  <p className="text-[10px] text-zinc-700 font-mono uppercase tracking-[0.2em] mt-2">Scanning Nexus for transmissions</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-4 bg-zinc-900/30 border-t border-zinc-800 flex justify-between items-center">
          <div className="flex gap-2">
             {[...Array(3)].map((_, i) => <div key={i} className="w-1 h-1 rounded-full bg-zinc-800" />)}
          </div>
          <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-[0.5em]">Nexus Integrity: Verified</span>
        </div>
      </div>
    </div>
  );
};

export default EventLogPage;
