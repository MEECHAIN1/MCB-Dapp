
import React, { useState } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { formatUnits, Address } from 'viem';
import { ADRS, MINIMAL_MARKETPLACE_ABI } from '../lib/contracts';
import { motion } from 'framer-motion';
import { ShoppingBag, Search, Cpu, ShieldCheck, XCircle, Zap, Activity, BarChart3 } from 'lucide-react';
import { useAppState } from '../context/useAppState';

const DISCOVERY_BOT_IDS = [1n, 2n, 3n, 4n, 5n, 6n, 7n, 8n];

const MarketplaceStat = ({ label, value, icon: Icon }: any) => (
  <div className="flex items-center gap-4 bg-zinc-950/50 border border-zinc-800/50 p-6 rounded-2xl flex-1">
    <div className="p-3 bg-zinc-900 rounded-xl text-yellow-500">
      <Icon size={16} />
    </div>
    <div>
      <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-xl font-black text-white uppercase italic tracking-tighter">{value}</p>
    </div>
  </div>
);

const BotListingCard: React.FC<{ 
  tokenId: bigint, 
  onBuy: (id: bigint, price: bigint) => Promise<void>,
  onCancel: (id: bigint) => Promise<void>,
  currentAccount?: Address 
}> = ({ tokenId, onBuy, onCancel, currentAccount }) => {
  const { data: listing, isLoading } = useReadContract({
    address: ADRS.swap as `0x${string}`,
    abi: MINIMAL_SWAP_ABI,
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
      className="bg-zinc-900/40 border border-zinc-800/50 rounded-[2.5rem] overflow-hidden group hover:border-yellow-500/40 transition-all flex flex-col relative shadow-xl hover:shadow-yellow-500/5"
    >
      <div className="aspect-square bg-black/60 relative flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.4),transparent_70%)] group-hover:opacity-30 transition-opacity" />
        <Cpu size={80} className="text-zinc-800 group-hover:text-yellow-500/20 transition-all group-hover:scale-110 z-0" />
        
        <div className="absolute top-6 left-6 z-10">
          <span className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[9px] font-mono px-3 py-1.5 rounded-full uppercase tracking-widest backdrop-blur-xl">
            Unit #{tokenId.toString()}
          </span>
        </div>

        {isOwner && (
          <div className="absolute top-6 right-6 z-10">
            <span className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[9px] font-mono px-3 py-1.5 rounded-full uppercase tracking-widest backdrop-blur-xl">
              Controlled by You
            </span>
          </div>
        )}
      </div>
      
      <div className="p-8 space-y-6 flex-1 flex flex-col justify-between">
        <div>
          <h4 className="text-white font-black uppercase tracking-tighter italic text-lg">Cyber-Bot Vanguard</h4>
          <div className="flex items-center gap-2 mt-2">
             <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
             <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Sign: {seller.slice(0, 6)}...{seller.slice(-4)}</p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-zinc-800/50 pt-6">
          <div className="flex flex-col">
             <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Ritual Energy</span>
             <span className="text-2xl font-black text-yellow-500 tracking-tighter">{formatUnits(price, 18)} MCB</span>
          </div>
          
          {isOwner ? (
            <button 
              onClick={() => onCancel(tokenId)}
              className="bg-zinc-800 text-zinc-400 p-4 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-xl"
              title="Cancel Ritual Listing"
            >
              <XCircle size={20} />
            </button>
          ) : (
            <button 
              onClick={() => onBuy(tokenId, price)}
              className="bg-yellow-500 text-black p-5 rounded-[2rem] hover:bg-yellow-400 transition-all shadow-[0_0_30px_rgba(234,179,8,0.2)] hover:scale-105 active:scale-95"
            >
              <ShoppingBag size={16} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const MarketplacePage: React.FC = () => {
  const { address } = useAccount();
  const { executeRitual, setError } = useAppState();
  const [searchTerm, setSearchTerm] = useState('');

  const { writeContractAsync } = useWriteContract();

  const handleBuy = async (tokenId: bigint, price: bigint) => {
    if (!address) {
      setError("Synchronize your signature to perform this trade.");
      return;
    }
    await executeRitual(() => 
      writeContractAsync({
        address: ADRS.swap as `0x${string}`,
        abi: MINIMAL_SWAP_ABI,
        functionName: 'buyNFT',
        args: [tokenId],
        value: price,
      })
    );
  };

  const handleCancel = async (tokenId: bigint) => {
    await executeRitual(() => 
      writeContractAsync({
        address: ADRS.swap as `0x${string}`,
        abi: MINIMAL_SWAP_ABI,
        functionName: 'cancelListing',
        args: [tokenId],
      })
    );
  };

  return (
    <div className="space-y-16 pb-24 relative">
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-yellow-500/5 blur-[150px] rounded-full pointer-events-none" />

      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 relative z-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="bg-yellow-500 text-black text-[10px] font-black uppercase px-3 py-1 rounded tracking-[0.2em]">Protocol V1.2</span>
            <p className="text-yellow-500/60 font-mono text-[10px] uppercase tracking-[0.5em]">Nexus Exchange Terminal</p>
          </div>
          <h1 className="text-7xl font-black italic uppercase tracking-tighter text-white">Cyber-Nexus</h1>
          <p className="text-zinc-500 font-mono text-sm uppercase tracking-[0.2em]">The Primary Decentralized Exchange for MEE-Bot Ritual Assets</p>
        </div>

        <div className="relative group min-w-[320px]">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-yellow-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search Fleet Manifest..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-zinc-950/80 border border-zinc-800 rounded-[2rem] py-5 pl-14 pr-8 text-sm font-mono focus:border-yellow-500/50 outline-none w-full transition-all backdrop-blur-2xl shadow-2xl"
          />
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-6">
        <MarketplaceStat label="Floor Ritual Energy" value="125 MCB" icon={Zap} />
        <MarketplaceStat label="Total Volume" value="48.2K MCB" icon={BarChart3} />
        <MarketplaceStat label="Active Listings" value="152 Units" icon={Activity} />
      </div>

      <div className="bg-zinc-900/10 border border-zinc-800/50 p-10 rounded-[3rem] relative overflow-hidden backdrop-blur-md">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center gap-10 mb-12">
          <div className="p-6 bg-yellow-500/10 rounded-[2rem] border border-yellow-500/20">
            <ShieldCheck size={48} className="text-yellow-500" />
          </div>
          <div className="flex-1 text-center md:text-left space-y-2">
            <h3 className="text-white font-black uppercase italic tracking-tight text-2xl">Nexus Security Protocol</h3>
            <p className="text-zinc-400 text-xs font-mono uppercase tracking-[0.2em] max-w-2xl leading-relaxed">
              All trades are non-custodial and validated through the MeeChain Core. 
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {DISCOVERY_BOT_IDS.map(id => (
            <BotListingCard 
              key={id.toString()} 
              tokenId={id} 
              onBuy={handleBuy} 
              onCancel={handleCancel}
              currentAccount={address} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MarketplacePage;
