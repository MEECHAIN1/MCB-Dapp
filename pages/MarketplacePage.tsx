
import React, { useState } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { ADRS, MINIMAL_MARKETPLACE_ABI, MINIMAL_NFT_ABI } from '../lib/contracts';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Tag, Search, Filter, Cpu, CreditCard, ShieldCheck } from 'lucide-react';
import { useAppState } from '../context/useAppState';

// Mock listings since we can't easily iterate all listings on-chain without an indexer
const MOCK_BOT_IDS = [1n, 2n, 3n, 4n, 5n, 6n];

const BotListingCard = ({ tokenId, onBuy }: { tokenId: bigint, onBuy: (id: bigint, price: bigint) => void }) => {
  const { data: listing, isLoading } = useReadContract({
    address: ADRS.marketplace as `0x${string}`,
    abi: MINIMAL_MARKETPLACE_ABI,
    functionName: 'listings',
    args: [tokenId],
  });

  if (isLoading || !listing || !listing[2]) return null;

  const [seller, price, isActive] = listing;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden group hover:border-yellow-500/30 transition-all flex flex-col"
    >
      <div className="aspect-square bg-black/40 relative flex items-center justify-center overflow-hidden">
        <Cpu size={80} className="text-zinc-800 group-hover:text-yellow-500/20 transition-colors" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
        <div className="absolute top-4 left-4">
          <span className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[8px] font-mono px-2 py-1 rounded-full uppercase tracking-widest">
            ID #{tokenId.toString()}
          </span>
        </div>
      </div>
      
      <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
        <div>
          <h4 className="text-white font-black uppercase tracking-tighter">MCB-BOT UNIT</h4>
          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-1">Origin: {seller.slice(0, 6)}...{seller.slice(-4)}</p>
        </div>

        <div className="flex items-center justify-between border-t border-zinc-800 pt-4">
          <div className="flex flex-col">
             <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest">Ritual Cost</span>
             <span className="text-lg font-black text-yellow-500">{formatUnits(price, 18)} MCB</span>
          </div>
          <button 
            onClick={() => onBuy(tokenId, price)}
            className="bg-yellow-500 text-black p-3 rounded-xl hover:bg-yellow-400 transition-all shadow-[0_0_15px_rgba(234,179,8,0.2)]"
          >
            <ShoppingBag size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const MarketplacePage: React.FC = () => {
  const { address } = useAccount();
  const { setLoading, setError, triggerSuccess, setTxHash } = useAppState();
  const [searchTerm, setSearchTerm] = useState('');

  const { writeContractAsync, data: hash, isPending } = useWriteContract();
  const { isLoading: isTxLoading, isSuccess } = useWaitForTransactionReceipt({ hash });

  React.useEffect(() => {
    if (isSuccess) {
      triggerSuccess();
      setLoading(false);
    }
  }, [isSuccess, triggerSuccess, setLoading]);

  const handleBuy = async (tokenId: bigint, price: bigint) => {
    if (!address) {
      setError("Synchronize your signature to perform this trade.");
      return;
    }
    setLoading(true);
    try {
      const resultHash = await writeContractAsync({
        address: ADRS.marketplace as `0x${string}`,
        abi: MINIMAL_MARKETPLACE_ABI,
        functionName: 'buyNFT',
        args: [tokenId],
        value: price,
      });
      setTxHash(resultHash);
    } catch (err: any) {
      setError(err.shortMessage || err.message);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white">Cyber-Nexus</h1>
          <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.3em] mt-2">MeeChain Asset Exchange Terminal</p>
        </div>

        <div className="flex items-center gap-3">
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
              <input 
                type="text" 
                placeholder="Search Bots..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl py-3 pl-12 pr-6 text-xs font-mono focus:border-yellow-500/50 outline-none w-64 text-white"
              />
           </div>
           <button className="bg-zinc-900 border border-zinc-800 p-3 rounded-2xl text-zinc-400 hover:text-white transition-colors">
              <Filter size={18} />
           </button>
        </div>
      </header>

      {/* Info Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-indigo-950/20 border border-indigo-500/30 p-6 rounded-[2rem] flex flex-col md:flex-row items-center gap-6"
      >
        <div className="p-4 bg-indigo-500/20 rounded-2xl">
          <ShieldCheck size={32} className="text-indigo-400" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-white font-black uppercase italic tracking-tight">Escrow of Nexus</h3>
          <p className="text-zinc-400 text-[10px] font-mono uppercase tracking-widest mt-1">All trades are secured by the MCB core protocols. Your assets are protected during flux transitions.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="text-right">
              <span className="block text-[8px] font-mono text-zinc-500 uppercase tracking-widest">Market Volume</span>
              <span className="block text-white font-black">1.2M MCB</span>
           </div>
           <div className="w-10 h-10 rounded-full border border-indigo-500/30 flex items-center justify-center">
              <CreditCard size={16} className="text-indigo-400" />
           </div>
        </div>
      </motion.div>

      {/* Market Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {MOCK_BOT_IDS.map(id => (
          <BotListingCard key={id.toString()} tokenId={id} onBuy={handleBuy} />
        ))}
        
        {/* Placeholder if market empty */}
        <div className="col-span-full py-20 bg-zinc-900/10 border-2 border-dashed border-zinc-800 rounded-[2.5rem] flex flex-col items-center justify-center">
          <Tag size={48} className="text-zinc-800 mb-4" />
          <p className="text-zinc-600 font-mono text-[10px] uppercase tracking-[0.4em]">Scanning for new trade fluxes...</p>
        </div>
      </div>
    </div>
  );
};

export default MarketplacePage;
