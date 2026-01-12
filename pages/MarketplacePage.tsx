
import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, usePublicClient } from 'wagmi';
import { formatUnits, Address, parseUnits } from 'viem';
import { ADRS, MINIMAL_MARKETPLACE_ABI, MINIMAL_NFT_ABI } from '../lib/contracts';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Search, Cpu, ShieldCheck, XCircle, Zap, Activity, BarChart3, Loader2, Filter, TrendingUp, History } from 'lucide-react';
import { useAppState } from '../context/useAppState';

// Generate a larger range of IDs for discovery in a demo environment
const DISCOVERY_BOT_IDS = Array.from({ length: 24 }, (_, i) => BigInt(i + 1));

const MarketplaceStat = ({ label, value, icon: Icon, trend }: any) => (
  <div className="flex items-center gap-5 bg-zinc-950/40 border border-zinc-800/40 p-6 rounded-3xl flex-1 backdrop-blur-md hover:bg-zinc-900/40 transition-colors group">
    <div className="p-4 bg-zinc-900 rounded-2xl text-yellow-500 group-hover:scale-110 transition-transform shadow-inner">
      <Icon size={22} />
    </div>
    <div>
      <div className="flex items-center gap-2 mb-1">
        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{label}</p>
        {trend && <span className="text-[8px] font-bold text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded-full">{trend}</span>}
      </div>
      <p className="text-2xl font-black text-white uppercase italic tracking-tighter">{value}</p>
    </div>
  </div>
);

const BotListingCard: React.FC<{ 
  tokenId: bigint, 
  onBuy: (id: bigint, price: bigint) => Promise<void>,
  onCancel: (id: bigint) => Promise<void>,
  currentAccount?: Address 
}> = ({ tokenId, onBuy, onCancel, currentAccount }) => {
  const { data: listing, isLoading, refetch } = useReadContract({
    address: ADRS.marketplace as `0x${string}`,
    abi: MINIMAL_MARKETPLACE_ABI,
    functionName: 'listings',
    args: [tokenId],
    query: {
      staleTime: 5000,
    }
  });

  const [isPending, setIsPending] = useState(false);

  // In this ritual, we only show active listings
  if (isLoading || !listing || !listing[2]) return null;

  const [seller, price, isActive] = listing;
  const isOwner = currentAccount?.toLowerCase() === seller.toLowerCase();

  const handleAction = async (action: 'buy' | 'cancel') => {
    setIsPending(true);
    try {
      if (action === 'cancel') {
        await onCancel(tokenId);
      } else {
        await onBuy(tokenId, price);
      }
      await refetch();
    } catch (e) {
      console.error("Trade Action Failed:", e);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      className="bg-zinc-900/30 border border-zinc-800/60 rounded-[2.5rem] overflow-hidden group hover:border-yellow-500/40 transition-all flex flex-col relative shadow-2xl backdrop-blur-sm"
    >
      <div className="aspect-square bg-zinc-950 relative flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.3),transparent_75%)] group-hover:opacity-50 transition-opacity" />
        
        {/* Animated Cyber-Orb behind the bot icon */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-10 border border-zinc-800 rounded-full border-dashed opacity-30"
        />
        
        <Cpu size={90} className="text-zinc-900 group-hover:text-yellow-500/30 transition-all group-hover:scale-110 z-0 drop-shadow-[0_0_20px_rgba(234,179,8,0.1)]" />
        
        <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
          <span className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 text-[10px] font-mono px-4 py-2 rounded-xl uppercase tracking-widest backdrop-blur-2xl font-bold">
            ID: #{tokenId.toString()}
          </span>
          {isOwner && (
            <span className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[9px] font-mono px-3 py-1.5 rounded-xl uppercase tracking-widest backdrop-blur-2xl font-bold flex items-center gap-1.5">
              <ShieldCheck size={10} /> Authorized Asset
            </span>
          )}
        </div>

        {isPending && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md z-30 flex flex-col items-center justify-center gap-4">
            <Loader2 className="text-yellow-500 animate-spin" size={48} />
            <span className="text-[10px] font-mono text-yellow-500 uppercase tracking-[0.3em]">Processing Trade...</span>
          </div>
        )}
      </div>
      
      <div className="p-8 space-y-6 flex-1 flex flex-col justify-between bg-gradient-to-b from-transparent to-black/40">
        <div>
          <div className="flex justify-between items-start mb-2">
            <h4 className="text-white font-black uppercase tracking-tighter italic text-xl">MCB-Bot Vanguard</h4>
          </div>
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
             <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest truncate">Sign: {seller}</p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-zinc-800/80 pt-6">
          <div className="flex flex-col">
             <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Acquisition Cost</span>
             <span className="text-2xl font-black text-yellow-500 tracking-tighter italic">{formatUnits(price, 18)} <span className="text-xs font-mono not-italic text-yellow-500/60 ml-0.5">MCB</span></span>
          </div>
          
          {isOwner ? (
            <button 
              onClick={() => handleAction('cancel')}
              disabled={isPending}
              className="bg-zinc-800 text-zinc-500 p-5 rounded-[2rem] hover:bg-red-500 hover:text-white transition-all shadow-xl disabled:opacity-50 group/btn"
              title="Cancel Ritual Listing"
            >
              <XCircle size={22} className="group-hover/btn:rotate-90 transition-transform duration-300" />
            </button>
          ) : (
            <button 
              onClick={() => handleAction('buy')}
              disabled={isPending}
              className="bg-yellow-500 text-black p-5 rounded-[2rem] hover:bg-yellow-400 transition-all shadow-[0_0_40px_rgba(234,179,8,0.3)] hover:scale-110 active:scale-95 disabled:opacity-50 group/btn"
            >
              <ShoppingBag size={24} className="group-hover/btn:-rotate-12 transition-transform" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const MarketplacePage: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { executeRitual, setError, language } = useAppState();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'mine' | 'other'>('all');

  const { writeContractAsync } = useWriteContract();

  const handleBuy = async (tokenId: bigint, price: bigint) => {
    if (!isConnected) {
      setError(language === 'EN' ? "Synchronize your signature to trade." : "กรุณาซิงโครไนซ์เพื่อทำการซื้อขาย");
      return;
    }
    await executeRitual(() => 
      writeContractAsync({
        address: ADRS.marketplace as `0x${string}`,
        abi: MINIMAL_MARKETPLACE_ABI,
        functionName: 'buyNFT',
        args: [tokenId],
        value: price,
      })
    );
  };

  const handleCancel = async (tokenId: bigint) => {
    await executeRitual(() => 
      writeContractAsync({
        address: ADRS.marketplace as `0x${string}`,
        abi: MINIMAL_MARKETPLACE_ABI,
        functionName: 'cancelListing',
        args: [tokenId],
      })
    );
  };

  return (
    <div className="space-y-16 pb-32 relative">
      {/* Decorative background glow */}
      <div className="absolute -top-60 -left-60 w-[800px] h-[800px] bg-yellow-500/5 blur-[180px] rounded-full pointer-events-none" />

      <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-12 relative z-10">
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <span className="bg-yellow-500 text-black text-[10px] font-black uppercase px-4 py-1.5 rounded-lg tracking-[0.25em] shadow-[0_0_20px_rgba(234,179,8,0.2)]">Active Exchange</span>
            <p className="text-yellow-500/40 font-mono text-[10px] uppercase tracking-[0.6em] animate-pulse">Live Ritual Stream</p>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-8xl font-black italic uppercase tracking-tighter text-white leading-none"
          >
            Cyber-Nexus
          </motion.h1>
          <p className="text-zinc-500 font-mono text-sm uppercase tracking-[0.3em] max-w-xl leading-relaxed">
            The primary node for decentralized ritual asset exchange on MeeChain. 
            <span className="block mt-2 text-[10px] text-zinc-700">Protocol Layer: SECURED / 0x1337</span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
          <div className="relative group flex-1 xl:min-w-[400px]">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-yellow-500 transition-all" size={20} />
            <input 
              type="text" 
              placeholder="Search Fleet Index..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-zinc-950/90 border border-zinc-800 rounded-[2.5rem] py-6 pl-16 pr-8 text-sm font-mono focus:border-yellow-500/50 outline-none w-full transition-all backdrop-blur-3xl shadow-2xl placeholder:text-zinc-800"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'mine'] as const).map((m) => (
               <button 
                 key={m}
                 onClick={() => setFilterMode(m)}
                 className={`px-6 rounded-full border text-[10px] font-mono uppercase tracking-widest transition-all ${filterMode === m ? 'bg-zinc-100 text-black border-white' : 'bg-zinc-900/50 text-zinc-500 border-zinc-800 hover:border-zinc-700'}`}
               >
                 {m === 'all' ? 'Every Unit' : 'My Assets'}
               </button>
            ))}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MarketplaceStat label="Avg Ritual Energy" value="158.4 MCB" icon={TrendingUp} trend="+12.4%" />
        <MarketplaceStat label="Nexus Exchange Volume" value="842K MCB" icon={BarChart3} />
        <MarketplaceStat label="Active Transmissions" value="412 Units" icon={Activity} />
      </div>

      <div className="bg-zinc-900/5 border border-zinc-800/40 p-10 lg:p-14 rounded-[4rem] relative overflow-hidden backdrop-blur-md">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center gap-12 mb-16">
          <div className="p-8 bg-zinc-900/80 rounded-[2.5rem] border border-zinc-800 shadow-inner group overflow-hidden relative">
            <ShieldCheck size={56} className="text-yellow-500 relative z-10" />
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(234,179,8,0.1))] -z-0"
            />
          </div>
          <div className="flex-1 text-center md:text-left space-y-4">
            <h3 className="text-white font-black uppercase italic tracking-tight text-3xl">Synchronized Trading Hub</h3>
            <p className="text-zinc-500 text-xs font-mono uppercase tracking-[0.25em] max-w-3xl leading-relaxed">
              Experience zero-fee listing rituals. All acquisitions are finalized through atomic dimensional swaps, 
              ensuring 100% integrity of your cyber-fleet.
            </p>
            <div className="flex items-center gap-6 justify-center md:justify-start">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                <span className="text-[9px] font-mono text-zinc-600 uppercase">Non-Custodial</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                <span className="text-[9px] font-mono text-zinc-600 uppercase">Instant Rituals</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8 lg:gap-12">
          {DISCOVERY_BOT_IDS
            .filter(id => id.toString().includes(searchTerm))
            .map(id => (
            <BotListingCard 
              key={id.toString()} 
              tokenId={id} 
              onBuy={handleBuy} 
              onCancel={handleCancel}
              currentAccount={address} 
            />
          ))}
        </div>

        {/* Empty state simulated */}
        <AnimatePresence>
          {searchTerm && DISCOVERY_BOT_IDS.filter(id => id.toString().includes(searchTerm)).length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-32 flex flex-col items-center justify-center text-center space-y-6"
            >
              <History size={64} className="text-zinc-800 mb-4" />
              <div>
                <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.5em]">No Units Match the Search Flux</p>
                <p className="text-zinc-700 text-[10px] font-mono uppercase tracking-widest mt-2">Adjust your spectral search parameters</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <footer className="pt-10 flex items-center justify-between px-10">
        <div className="flex gap-2">
           {[...Array(5)].map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-zinc-900" />)}
        </div>
        <p className="text-[9px] font-mono text-zinc-700 uppercase tracking-[0.8em]">MeeChain Terminal Node: Secured</p>
      </footer>
    </div>
  );
};

export default MarketplacePage;
