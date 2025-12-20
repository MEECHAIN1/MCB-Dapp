
import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWatchContractEvent } from 'wagmi';
import { ADRS, MINIMAL_NFT_ABI } from '../lib/contracts';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, History, ExternalLink, Cpu } from 'lucide-react';
import { useAppState } from '../context/useAppState';

interface LogEntry {
  id: string;
  from: string;
  to: string;
  tokenId: string;
  time: string;
}

const GalleryPage: React.FC = () => {
  const { address } = useAccount();
  const { setLoading, setError } = useAppState();
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // Real-time Event Subscription
  useWatchContractEvent({
    address: ADRS.nft as `0x${string}`,
    abi: MINIMAL_NFT_ABI,
    eventName: 'Transfer',
    onLogs(logs) {
      const newLogs = logs.map(l => ({
        id: l.transactionHash || Math.random().toString(),
        from: (l.args as any).from,
        to: (l.args as any).to,
        tokenId: (l.args as any).tokenId?.toString(),
        time: new Date().toLocaleTimeString()
      }));
      setLogs(prev => [newLogs[0], ...prev].slice(0, 10));
    },
    onError(err) {
      setError("Log Stream Interrupted: " + err.message);
    }
  });

  const { data: balance, isLoading: isNftLoading, isError, error } = useReadContract({
    address: ADRS.nft as `0x${string}`,
    abi: MINIMAL_NFT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  // Sync loading state
  useEffect(() => {
    setLoading(isNftLoading);
  }, [isNftLoading, setLoading]);

  // Sync error state
  useEffect(() => {
    if (isError && error) {
      setError(error.message);
    }
  }, [isError, error, setError]);

  return (
    <div className="space-y-12">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">MEE-Bot Gallery</h1>
          <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.2em]">Owned Cybernetic Assets</p>
        </div>
        <div className="bg-zinc-900 px-6 py-2 rounded-full border border-zinc-800 text-xs font-mono uppercase tracking-widest">
          Count: <span className="text-yellow-500">{balance?.toString() || "0"}</span>
        </div>
      </header>

      {/* NFT Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {balance && Array.from({ length: Number(balance) }).map((_, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="aspect-square bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden group cursor-pointer relative"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
            <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:opacity-40 transition-opacity">
               <Cpu size={80} className="text-yellow-500" />
            </div>
            <div className="absolute bottom-4 left-4 z-20">
              <p className="text-[10px] font-mono text-yellow-500 uppercase tracking-widest">Series 01</p>
              <h4 className="font-black text-white uppercase tracking-tighter">MEE-BOT #{i + 1}</h4>
            </div>
          </motion.div>
        ))}
        {(!balance || Number(balance) === 0) && !isNftLoading && (
          <div className="col-span-full py-20 bg-zinc-900/20 border-2 border-dashed border-zinc-800 rounded-3xl flex flex-col items-center justify-center">
            <Box size={48} className="text-zinc-700 mb-4" />
            <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">No cybernetic assets detected</p>
          </div>
        )}
      </div>

      {/* Ritual Logs Section */}
      <section className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <h3 className="font-bold uppercase tracking-tight flex items-center gap-2">
            <History className="text-yellow-500" size={18} />
            Transmission Logs
          </h3>
          <span className="text-[10px] font-mono text-zinc-500 uppercase">Live Event Stream</span>
        </div>
        <div className="p-4 max-h-[300px] overflow-y-auto font-mono text-[11px]">
          <AnimatePresence initial={false}>
            {logs.length > 0 ? logs.map((log) => (
              <motion.div 
                key={log.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-4 py-3 border-b border-zinc-900 last:border-0"
              >
                <span className="text-zinc-600">[{log.time}]</span>
                <span className="text-blue-500 uppercase">Transfer</span>
                <span className="text-white">Bot #{log.tokenId}</span>
                <span className="text-zinc-500">from</span>
                <span className="text-zinc-300 truncate max-w-[80px]">{log.from}</span>
                <span className="text-zinc-500">to</span>
                <span className="text-zinc-300 truncate max-w-[80px]">{log.to}</span>
                <ExternalLink size={10} className="text-zinc-600 hover:text-white cursor-pointer ml-auto" />
              </motion.div>
            )) : (
              <div className="py-10 text-center text-zinc-600 uppercase tracking-widest animate-pulse">
                Awaiting incoming transmissions...
              </div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
};

export default GalleryPage;
