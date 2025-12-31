
import React from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { formatUnits } from 'viem';
import { ADRS, MINIMAL_ERC20_ABI, MINIMAL_NFT_ABI, MINIMAL_TOKEN_ABI, MINIMAL_SWAP_ABI,  MINIMAL_STAKING_ABI, } from '../lib/contracts';
import { motion } from 'framer-motion';
import { Coins, Layers, TrendingUp, Shield, Binary, Plus, ShoppingBag } from 'lucide-react';
import { HeroScene } from '../components/QuantumScene';
import { QuantumHUD } from '../components/QuantumHUD';
import { QuantumRitual } from '../components/QuantumRitual';
import { useAppState } from '../context/useAppState';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, unit, icon: Icon, color }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.02 }}
    className="bg-black/60 backdrop-blur-xl border border-zinc-800 p-6 rounded-2xl hover:border-yellow-500/50 transition-all group z-10"
  >
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl bg-zinc-900 group-hover:bg-zinc-800 transition-colors ${color}`}>
        <Icon size={24} />
      </div>
      <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-1">
        Live <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
      </div>
    </div>
    <h3 className="text-zinc-400 text-[10px] font-mono uppercase tracking-[0.2em] mb-1">{title}</h3>
    <div className="flex items-baseline gap-2">
      <span className="text-2xl font-black text-white">{value}</span>
      <span className="text-[10px] font-mono text-zinc-500 uppercase">{unit}</span>
    </div>
  </motion.div>
);

const DashboardPage: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { executeRitual } = useAppState();

  const { data: tokenBalance } = useReadContract({
    address: ADRS.token as `0x${string}`,
    abi: MINIMAL_ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 5000 }
  });

  const { data: nftBalance } = useReadContract({
    address: ADRS.nft as `0x${string}`,
    abi: MINIMAL_NFT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 5000 }
  });

  const { writeContractAsync } = useWriteContract();

  const handleAcquisition = async () => {
    if (!address) return;
    await executeRitual(() => 
      writeContractAsync({
        address: ADRS.nft as `0x${string}`,
        abi: MINIMAL_NFT_ABI,
        functionName: 'safeMint',
        args: [address, "ipfs://bot-telemetry-nexus"],
      })
    );
  };

  return (
    <div className="relative space-y-8 min-h-[85vh] flex flex-col justify-center">
      <HeroScene />
      <QuantumRitual />
      
      {isConnected && <QuantumHUD />}

      {!isConnected ? (
        <div className="relative flex flex-col items-center justify-center text-center z-10 px-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-10 bg-black/40 backdrop-blur-2xl rounded-[2.5rem] border border-zinc-800 max-w-lg mx-auto shadow-2xl"
          >
            <div className="w-24 h-24 bg-zinc-950 mx-auto rounded-full flex items-center justify-center mb-8 border border-zinc-800 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
              <Shield size={40} className="text-yellow-500/50" />
            </div>
            <h2 className="text-3xl font-black mb-4 uppercase tracking-tighter italic text-white">Access Protocol Required</h2>
            <p className="text-zinc-500 font-mono text-xs leading-relaxed uppercase tracking-[0.2em] max-w-xs mx-auto">
              Identify your cyber-signature to synchronize with the MeeChain Nexus.
            </p>
          </motion.div>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto w-full px-4 relative z-10 pt-10">
          <header className="mb-10 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <h1 className="text-5xl font-black tracking-tighter uppercase mb-2 italic">Nexus Telemetry</h1>
              <div className="flex items-center gap-2 text-zinc-500 font-mono text-[10px] uppercase tracking-[0.4em] justify-center md:justify-start">
                <Binary size={12} className="text-yellow-500" />
                Live Flux Stream • MeeChain-Ritual
              </div>
            </motion.div>

            <div className="flex gap-4">
              <button 
                onClick={handleAcquisition}
                className="bg-yellow-500 text-black px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-yellow-400 transition-all shadow-[0_0_20px_rgba(234,179,8,0.2)]"
              >
                <Plus size={16} /> Synchronize New Unit
              </button>
              <Link 
                to="/marketplace"
                className="bg-zinc-900 border border-zinc-800 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-zinc-800 transition-all"
              >
                <ShoppingBag size={16} /> Visit Marketplace
              </Link>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <StatCard 
              title="Sacred Flux" 
              value={tokenBalance ? parseFloat(formatUnits(tokenBalance, 18)).toFixed(2) : "0.00"} 
              unit="MCB Tokens" 
              icon={Coins} 
              color="text-yellow-500"
            />
            <StatCard 
              title="Cyber Fleet" 
              value={nftBalance?.toString() || "0"} 
              unit="Active Bots" 
              icon={Layers} 
              color="text-indigo-500"
            />
            <StatCard 
              title="Blessing Flow" 
              value="Simulated" 
              unit="MCB / Cycle" 
              icon={TrendingUp} 
              color="text-emerald-500"
            />
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-zinc-900/10 backdrop-blur-xl border border-zinc-800/50 rounded-3xl p-8 relative overflow-hidden group shadow-2xl"
          >
            <div className="h-[1px] bg-gradient-to-r from-transparent via-zinc-800 to-transparent w-full mb-8" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="space-y-1">
                <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Ritual Status</p>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-sm font-black text-white uppercase italic">Optimal</p>
                </div>
              </div>
              <div className="space-y-1 text-center md:text-left">
                <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Protocol</p>
                <p className="text-sm font-black text-white uppercase italic">MCB-Core</p>
              </div>
              <div className="space-y-1 hidden lg:block">
                <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Fleet Integrity</p>
                <p className="text-sm font-black text-white uppercase italic">100% Active</p>
              </div>
              <div className="space-y-1 hidden lg:block">
                <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Nexus Load</p>
                <p className="text-sm font-black text-white uppercase italic">Low</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
