
import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWatchContractEvent, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { ADRS, MINIMAL_NFT_ABI, MINIMAL_MARKETPLACE_ABI } from '../lib/contracts';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, History, ExternalLink, Cpu, Tag, DollarSign, X } from 'lucide-react';
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
  const { setLoading, setError, triggerSuccess, setTxHash } = useAppState();
  const [price, setPrice] = useState('');

  const { data: isApproved } = useReadContract({
    address: ADRS.nft as `0x${string}`,
    abi: MINIMAL_NFT_ABI,
    functionName: 'isApprovedForAll',
    args: address ? [address, ADRS.marketplace as `0x${string}`] : undefined,
  });

  const { writeContractAsync, data: hash, isPending } = useWriteContract();
  const { isLoading: isTxLoading, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess) {
      triggerSuccess();
      setLoading(false);
      onClose();
    }
  }, [isSuccess, triggerSuccess, setLoading, onClose]);

  const handleList = async () => {
    if (!price || isPending) return;
    setLoading(true);
    try {
      if (!isApproved) {
        await writeContractAsync({
          address: ADRS.nft as `0x${string}`,
          abi: MINIMAL_NFT_ABI,
          functionName: 'setApprovalForAll',
          args: [ADRS.marketplace as `0x${string}`, true],
        });
      }

      const resultHash = await writeContractAsync({
        address: ADRS.marketplace as `0x${string}`,
        abi: MINIMAL_MARKETPLACE_ABI,
        functionName: 'listNFT',
        args: [tokenId, parseUnits(price, 18)],
      });
      setTxHash(resultHash);
    } catch (err: any) {
      setError(err.shortMessage || err.message);
      setLoading(false);
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
        className="relative bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl"
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors">
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center border border-yellow-500/20">
            <Tag className="text-yellow-500" size={32} />
          </div>
          
          <div>
            <h3 className="text-2xl font-black uppercase tracking-tighter italic text-white">List Bot #{tokenId.toString()}</h3>
            <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest mt-1">Set the ritual cost for this asset</p>
          </div>

          <div className="w-full space-y-2">
             <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em] block text-left ml-2">Sale Price (MCB)</label>
             <div className="relative text-white">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                <input 
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-black border border-zinc-800 rounded-2xl py-4 pl-12 pr-6 text-lg font-mono focus:border-yellow-500/50 outline-none"
                />
             </div>
          </div>

          <button 
            onClick={handleList}
            disabled={!price || isPending}
            className="w-full bg-yellow-500 text-black py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-yellow-400 transition-all disabled:opacity-50 shadow-[0_0_30px_rgba(234,179,8,0.2)]"
          >
            {isPending ? 'Synchronizing...' : (isApproved ? 'Post to Nexus' : 'Approve & List')}
          </button>

          <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">Listing will be visible to all ritualists</p>
        </div>
      </motion.div>
    </div>
  );
};

const GalleryPage: React.FC = () => {
  const { address } = useAccount();
  const { setLoading, setError } = useAppState();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedBot, setSelectedBot] = useState<bigint | null>(null);

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

  useEffect(() => {
    setLoading(isNftLoading);
  }, [isNftLoading, setLoading]);

  useEffect(() => {
    if (isError && error) {
      setError(error.message);
    }
  }, [isError, error, setError]);

  return (
    <div className="space-y-12">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase mb-2 text-white">Bot Gallery</h1>
          <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.2em]">Owned Cybernetic Assets</p>
        </div>
        <div className="bg-zinc-900 px-6 py-2 rounded-full border border-zinc-800 text-xs font-mono uppercase tracking-widest text-zinc-300">
          Fleet Count: <span className="text-yellow-500">{balance?.toString() || "0"}</span>
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
            className="aspect-square bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden group relative"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent z-10" />
            <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:opacity-30 transition-opacity">
               <Cpu size={80} className="text-yellow-500" />
            </div>
            
            <div className="absolute bottom-4 left-4 z-20">
              <p className="text-[10px] font-mono text-yellow-500 uppercase tracking-widest">Nexus-Bot</p>
              <h4 className="font-black text-white uppercase tracking-tighter">UNIT #{i + 1}</h4>
            </div>

            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 z-30 transition-all backdrop-blur-sm bg-black/20">
               <button 
                 onClick={() => setSelectedBot(BigInt(i + 1))}
                 className="bg-yellow-500 text-black px-4 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-transform shadow-xl"
               >
                 <Tag size={12} /> List Asset
               </button>
            </div>
          </motion.div>
        ))}
        {(!balance || Number(balance) === 0) && !isNftLoading && (
          <div className="col-span-full py-20 bg-zinc-900/20 border-2 border-dashed border-zinc-800 rounded-3xl flex flex-col items-center justify-center">
            <Box size={48} className="text-zinc-700 mb-4" />
            <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">No assets detected in the fleet</p>
          </div>
        )}
      </div>

      {/* Ritual Logs Section */}
      <section className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <h3 className="font-bold uppercase tracking-tight flex items-center gap-2 text-white text-sm">
            <History className="text-yellow-500" size={18} />
            Flux Transmission Logs
          </h3>
          <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest">Live Nexus Feed</span>
        </div>
        <div className="p-4 max-h-[300px] overflow-y-auto font-mono text-[10px]">
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
                <span className="text-zinc-500">to</span>
                <span className="text-zinc-300 truncate max-w-[80px]">{log.to}</span>
                <ExternalLink size={10} className="text-zinc-600 hover:text-white cursor-pointer ml-auto" />
              </motion.div>
            )) : (
              <div className="py-10 text-center text-zinc-600 uppercase tracking-widest animate-pulse">
                Awaiting flux transmissions...
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
