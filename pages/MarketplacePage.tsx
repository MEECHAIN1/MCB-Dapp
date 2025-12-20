
import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useReadContracts } from 'wagmi';
import { parseUnits, formatUnits, Address } from 'viem';
import { ADRS, MINIMAL_MARKETPLACE_ABI } from '../lib/contracts';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Tag, Search, Filter, Cpu, CreditCard, ShieldCheck, XCircle, ExternalLink } from 'lucide-react';
import { useAppState } from '../context/useAppState';

// In a production environment, this list would be fetched from a subgraph or indexer.
const DISCOVERY_BOT_IDS = [1n, 2n, 3n, 4n, 5n, 6n, 7n, 8n];

const BotListingCard = ({ tokenId, onBuy, onCancel, currentAccount }: { 
  tokenId: bigint, 
  onBuy: (id: bigint, price: bigint) => void,
  onCancel: (id: bigint) => void,
  currentAccount?: Address 
}) => {
  const { data: listing, isLoading } = useReadContract({
    address: ADRS.marketplace as `0x${string}`,
    abi: MINIMAL_MARKETPLACE_ABI,
    functionName: 'listings',
    args: [tokenId],
  });

  if (isLoading || !listing || !listing[2]) return null;

  const [seller, price, isActive] = listing;
  const isOwner = currentAccount?.toLowerCase() === seller.toLowerCase();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900/40 border border-zinc-800/50 rounded-[2rem] overflow-hidden group hover:border-yellow-500/30 transition-all flex flex-col relative"
    >
      <div className="aspect-square bg-black/40 relative flex items-center justify-center overflow-hidden">
        {/* Futuristic Background Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(197,160,89,0.4),transparent_70%)] group-hover:opacity-20 transition-opacity" />
        <Cpu size={80} className="text-zinc-800 group-hover:text-yellow-500/20 transition-colors z-0" />
        
        <div className="absolute top-4 left-4 z-10">
          <span className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[8px] font-mono px-2 py-1 rounded-full uppercase tracking-widest backdrop-blur-md">
            MCB-ID #{tokenId.toString()}
          </span>
        </div>

        {isOwner && (
          <div className="absolute top-4 right-4 z-10">
            <span className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[8px] font-mono px-2 py-1 rounded-full uppercase tracking-widest backdrop-blur-md">
              Your Listing
            </span>
          </div>
        )}
      </div>
      
      <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
        <div>
          <h4 className="text-white font-black uppercase tracking-tighter italic">Cyber-Fleet Ritualist</h4>
          <div className="flex items-center gap-1.5 mt-1">
             <div className="w-1 h-1 rounded-full bg-yellow-500 animate-pulse" />
             <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Seller: {seller.slice(0, 6)}...{seller.slice(-4)}</p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-zinc-800/50 pt-5">
          <div className="flex flex-col">
             <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Ritual Energy</span>
             <span className="text-xl font-black text-yellow-500 tracking-tighter">{formatUnits(price, 18)} MCB</span>
          </div>
          
          {isOwner ? (
            <button 
              onClick={() => onCancel(tokenId)}
              className="bg-zinc-800 text-zinc-400 p-3 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-xl"
              title="Cancel Listing"
            >
              <XCircle size={18} />
            </button>
          ) : (
            <button 
              onClick={() => onBuy(tokenId, price)}
              className="bg-yellow-500 text-black p-4 rounded-2xl hover:bg-yellow-400 transition-all shadow-[0_0_20px_rgba(234,179,8,0.2)] hover:scale-105 active:scale-95"
            >
              <ShoppingBag size={20} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const MarketplacePage: React.FC = () => {
  const { address } = useAccount();
  const { setLoading, setError, triggerSuccess, setTxHash } = useAppState();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'mine'>('all');

  const { writeContractAsync } = useWriteContract();

  const handleBuy = async (tokenId: bigint, price: bigint) => {
    if (!address) {
      setError("Synchronize your signature to perform this trade.");
      return;
    }
    setLoading(true);
    try {
      const hash = await writeContractAsync({
        address: ADRS.marketplace as `0x${string}`,
        abi: MINIMAL_MARKETPLACE_ABI,
        functionName: 'buyNFT',
        args: [tokenId],
        value: price,
      });
      setTxHash(hash);
      // Success is handled by StatusOverlay watching hash if needed, or we wait here
    } catch (err: any) {
      setError(err.shortMessage || err.message);
      setLoading(false);
    }
  };

  const handleCancel = async (tokenId: bigint) => {
    setLoading(true);
    try {
      const hash = await writeContractAsync({
        address: ADRS.marketplace as `0x${string}`,
        abi: MINIMAL_MARKETPLACE_ABI,
        functionName: 'cancelListing',
        args: [tokenId],
      });
      setTxHash(hash);
    } catch (err: any) {
      setError(err.shortMessage || err.message);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 pb-24 relative">
      {/* Background Decor */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 -right-24 w-64 h-64 bg-yellow-500/5 blur-[100px] rounded-full pointer-events-none" />

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 relative z-10">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-yellow-500 text-black text-[8px] font-black uppercase px-2 py-0.5 rounded tracking-widest">Beta</span>
            <p className="text-yellow-500/60 font-mono text-[9px] uppercase tracking-[0.4em]">Nexus Peer-to-Peer</p>
          </div>
          <h1 className="text-6xl font-black italic uppercase tracking-tighter text-white">Cyber-Nexus</h1>
          <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.2em]">The Primary MEE-Bot Asset Exchange Terminal</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-yellow-500 transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Find specific Bots..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-zinc-900/60 border border-zinc-800 rounded-2xl py-4 pl-12 pr-6 text-xs font-mono focus:border-yellow-500/50 outline-none w-full sm:w-72 transition-all backdrop-blur-md"
              />
           </div>
           <div className="flex items-center bg-zinc-900/60 border border-zinc-800 rounded-2xl p-1.5 backdrop-blur-md">
              <button 
                onClick={() => setFilter('all')}
                className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'all' ? 'bg-zinc-800 text-white shadow-xl' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                All Assets
              </button>
              <button 
                onClick={() => setFilter('mine')}
                className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'mine' ? 'bg-zinc-800 text-white shadow-xl' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                My Listings
              </button>
           </div>
        </div>
      </header>

      {/* Trust & Stats Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900/20 border border-zinc-800/40 p-8 rounded-[3rem] flex flex-col md:flex-row items-center gap-8 relative overflow-hidden backdrop-blur-sm"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="p-5 bg-indigo-500/10 rounded-3xl border border-indigo-500/20">
          <ShieldCheck size={40} className="text-indigo-400" />
        </div>
        
        <div className="flex-1 text-center md:text-left space-y-1">
          <h3 className="text-white font-black uppercase italic tracking-tight text-xl">Nexus Guard Protocol</h3>
          <p className="text-zinc-400 text-[10px] font-mono uppercase tracking-[0.2em] max-w-lg">
            All trades are processed through the core MCB Marketplace contract. 
            Assets are held in escrow only during the ritual verification phase.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 px-8 border-l border-zinc-800/50 hidden lg:grid">
           <div>
              <span className="block text-[8px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Avg Ritual Cost</span>
              <span className="block text-white font-black text-xl italic tracking-tighter">420 MCB</span>
           </div>
           <div>
              <span className="block text-[8px] font-mono text-zinc-500 uppercase tracking-widest mb-1">24h Flux</span>
              <span className="block text-emerald-500 font-black text-xl italic tracking-tighter">+12.4%</span>
           </div>
        </div>
      </motion.div>

      {/* Market Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {DISCOVERY_BOT_IDS.map(id => (
          <BotListingCard 
            key={id.toString()} 
            tokenId={id} 
            onBuy={handleBuy} 
            onCancel={handleCancel}
            currentAccount={address} 
          />
        ))}
        
        {/* Loading/Empty State Message */}
        <div className="col-span-full py-32 bg-zinc-900/5 border-2 border-dashed border-zinc-800/50 rounded-[3rem] flex flex-col items-center justify-center space-y-6">
          <div className="relative">
             <Tag size={64} className="text-zinc-800" />
             <div className="absolute inset-0 bg-yellow-500/10 blur-2xl rounded-full" />
          </div>
          <div className="text-center">
            <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-[0.5em]">Tuning into the peer-to-peer nexus...</p>
            <p className="text-zinc-700 text-[8px] font-mono uppercase tracking-widest mt-2 italic">Awaiting further asset manifests from the core.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplacePage;
