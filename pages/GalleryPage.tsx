
import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWatchContractEvent, useWriteContract } from 'wagmi';
import { ADRS, MINIMAL_NFT_ABI, MINIMAL_SWAP_ABI } from '../lib/contracts';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, History, ExternalLink, Cpu, Tag, DollarSign, X, CheckCircle2 } from 'lucide-react';
import { useAppState } from '../context/useAppState';
import { parseUnits } from 'viem';

interface LogEntry {
  id: string;
  from: string;
  to: string;
  tokenId: string;
  time: string;
}

const SellModal = ({ tokenId, isOpen, onClose }: { tokenId: bigint, isOpen: boolean, onClose: () => void }) => {
  const { address } = useAccount();
  const { executeRitual, isLoading } = useAppState();
  const [price, setPrice] = useState('');
  const [step, setStep] = useState<'input' | 'approving' | 'listing'>('input');

  const { data: isApproved, refetch: refetchApproval } = useReadContract({
    address: ADRS.nft as `0x${string}`,
    abi: MINIMAL_NFT_ABI,
    functionName: 'isApprovedForAll',
    args: address ? [address, ADRS.marketplace as `0x${string}`] : undefined,
  });

  const { writeContractAsync } = useWriteContract();

  const handleList = async () => {
    if (!price || !address) return;
    
    try {
      // 1. Handle Approval if needed
      if (!isApproved) {
        setStep('approving');
        await executeRitual(() => 
          writeContractAsync({
            address: ADRS.nft as `0x${string}`,
            abi: MINIMAL_NFT_ABI,
            functionName: 'setApprovalForAll',
            args: [ADRS.swap as `0x${string}`, true],
          })
        );
        await refetchApproval();
        await executeListing();
      } else {
        await executeListing();
      }
    } catch (err) {
      setStep('input');
    }
  };

  const executeListing = async () => {
    setStep('listing');
    try {
      await executeRitual(() => 
        writeContractAsync({
          address: ADRS.marketplace as `0x${string}`,
          abi: MINIMAL_SWAP_ABI,
          functionName: 'listNFT',
          args: [tokenId, parseUnits(price, 18)],
        })
      );
      onClose();
    } catch (err) {
      setStep('input');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative bg-zinc-950 border border-zinc-800 p-10 rounded-[3rem] w-full max-w-md shadow-2xl overflow-hidden"
      >
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-500/10 blur-3xl rounded-full" />
        
        <button onClick={onClose} className="absolute top-8 right-8 text-zinc-500 hover:text-white transition-colors bg-white/5 p-1.5 rounded-lg">
          <X size={18} />
        </button>

        <div className="flex flex-col items-center text-center space-y-8 relative z-10">
          <div className="w-24 h-24 bg-yellow-500/10 rounded-3xl flex items-center justify-center border border-yellow-500/20 shadow-[inset_0_0_20px_rgba(234,179,8,0.1)]">
            <Tag className="text-yellow-500" size={40} />
          </div>
          
          <div>
            <h3 className="text-3xl font-black uppercase tracking-tighter italic text-white">List Asset #{tokenId.toString()}</h3>
            <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-[0.3em] mt-2">Synchronization with Cyber-Nexus</p>
          </div>

          <div className="w-full space-y-3">
             <div className="flex justify-between px-2">
               <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Ritual Cost</label>
               <span className="text-[10px] font-mono text-yellow-500/50 uppercase">Current Unit: MCB</span>
             </div>
             <div className="relative text-white group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-yellow-500 transition-colors">
                  <DollarSign size={20} />
                </div>
                <input 
                  type="number"
                  value={price}
                  disabled={isLoading}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-black/50 border border-zinc-800 rounded-3xl py-5 pl-14 pr-6 text-xl font-mono focus:border-yellow-500/50 outline-none transition-all placeholder:text-zinc-800 disabled:opacity-50"
                />
             </div>
          </div>

          <div className="w-full space-y-3">
            <button 
              onClick={handleList}
              disabled={!price || isLoading}
              className="w-full bg-yellow-500 text-black py-5 rounded-[2rem] font-black uppercase tracking-widest hover:bg-yellow-400 transition-all disabled:opacity-50 shadow-[0_0_30px_rgba(234,179,8,0.2)] active:scale-95 flex items-center justify-center gap-3"
            >
              {!isLoading ? "Commit to Nexus" : (
                <span className="flex items-center gap-2">
                   <Cpu className="animate-spin" size={18} />
                   {step === 'approving' ? 'Authorizing Flow...' : 'Posting Ritual...'}
                </span>
              )}
            </button>
            
            <AnimatePresence>
              {!isApproved && step === 'input' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="flex items-center gap-2 justify-center text-blue-400 text-[8px] font-mono uppercase tracking-widest bg-blue-500/5 py-2 rounded-xl border border-blue-500/20"
                >
                  <CheckCircle2 size={12} />
                  First-time Swap Approval Required
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <p className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">All listings can be cancelled in the nexus dashboard</p>
        </div>
      </motion.div>
    </div>
  );
};

const GalleryPage: React.FC = () => {
  const { address } = useAccount();
  const { setError } = useAppState();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedBot, setSelectedBot] = useState<bigint | null>(null);

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

  const { data: balance, isLoading: isNftLoading } = useReadContract({
    address: ADRS.nft as `0x${string}`,
    abi: MINIMAL_NFT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  return (
    <div className="space-y-12 pb-24">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tighter uppercase mb-2 text-white italic">Asset Gallery</h1>
          <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.3em]">Owned Cybernetic Fleet</p>
        </div>
        <div className="bg-zinc-900/50 backdrop-blur-md px-8 py-3 rounded-2xl border border-zinc-800 text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-300">
          Operational Units: <span className="text-yellow-500 font-black ml-1">{balance?.toString() || "0"}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {balance && Array.from({ length: Number(balance) }).map((_, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="aspect-square bg-zinc-900/40 border border-zinc-800/50 rounded-[2.5rem] overflow-hidden group relative flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
            <div className="absolute inset-0 flex items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity">
               <Cpu size={120} className="text-yellow-500" />
            </div>
            <div className="absolute bottom-6 left-8 z-20">
              <p className="text-[10px] font-mono text-yellow-500/60 uppercase tracking-widest mb-1">Fleet Unit</p>
              <h4 className="font-black text-white uppercase tracking-tighter text-xl italic">MCB-BOT #{i + 1}</h4>
            </div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 z-30 transition-all backdrop-blur-md bg-black/40">
               <button 
                 onClick={() => setSelectedBot(BigInt(i + 1))}
                 className="bg-yellow-500 text-black px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-transform shadow-[0_0_30px_rgba(234,179,8,0.3)]"
               >
                 <Tag size={16} /> List on Nexus
               </button>
            </div>
          </motion.div>
        ))}
        {(!balance || Number(balance) === 0) && !isNftLoading && (
          <div className="col-span-full py-32 bg-zinc-900/10 border-2 border-dashed border-zinc-800/50 rounded-[3rem] flex flex-col items-center justify-center space-y-6">
            <Box size={56} className="text-zinc-800" />
            <div className="text-center">
               <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.4em]">No units detected in the local nexus</p>
               <p className="text-zinc-700 text-[10px] font-mono uppercase tracking-widest mt-2">Initialize acquisition ritual to populate fleet.</p>
            </div>
          </div>
        )}
      </div>

      <section className="bg-zinc-950 border border-zinc-800 rounded-[3rem] overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/30">
          <h3 className="font-black italic uppercase tracking-tighter flex items-center gap-3 text-white text-lg">
            <History className="text-yellow-500" size={24} />
            Fleet Transmission Logs
          </h3>
          <div className="flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
             <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Sync Active</span>
          </div>
        </div>
        <div className="p-6 max-h-[350px] overflow-y-auto font-mono text-[10px] space-y-2 custom-scrollbar">
          <AnimatePresence initial={false}>
            {logs.length > 0 ? logs.map((log) => (
              <motion.div 
                key={log.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-4 py-4 px-6 bg-zinc-900/20 border border-zinc-800/30 rounded-2xl hover:bg-zinc-800/20 transition-colors"
              >
                <span className="text-zinc-600 text-[9px]">[{log.time}]</span>
                <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded text-[8px] uppercase font-black">Sync</span>
                <span className="text-white font-bold">Bot #{log.tokenId}</span>
                <span className="text-zinc-500 uppercase text-[9px]">Transferred to</span>
                <span className="text-yellow-500/80 truncate max-w-[100px]">{log.to}</span>
                <a 
                  href={`https://explorer.meechain.io/tx/${log.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-auto text-zinc-600 hover:text-white transition-colors"
                >
                  <ExternalLink size={14} />
                </a>
              </motion.div>
            )) : (
              <div className="py-20 text-center text-zinc-700 uppercase tracking-[0.6em] animate-pulse italic text-xs">
                Listening for nexus transmissions...
              </div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <AnimatePresence>
        {selectedBot !== null && (
          <SellModal 
            tokenId={selectedBot} 
            isOpen={true} 
            onClose={() => setSelectedBot(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default GalleryPage;
