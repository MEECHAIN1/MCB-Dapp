
import React from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import { ADRS, MINIMAL_ERC20_ABI, MINIMAL_NFT_ABI, MINIMAL_STAKING_ABI } from '../lib/contracts';
import { motion } from 'framer-motion';
import { Coins, Layers, TrendingUp, Info, Zap } from 'lucide-react';
import { HeroScene } from '../components/QuantumScene';

const StatCard = ({ title, value, unit, icon: Icon, color }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-zinc-900/60 backdrop-blur-md border border-zinc-800 p-6 rounded-2xl hover:border-yellow-500/50 transition-all group z-10"
  >
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl bg-zinc-800 group-hover:scale-110 transition-transform ${color}`}>
        <Icon size={24} />
      </div>
      <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-1">
        Live <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
      </div>
    </div>
    <h3 className="text-zinc-400 text-xs font-mono uppercase tracking-wider mb-1">{title}</h3>
    <div className="flex items-baseline gap-2">
      <span className="text-2xl font-black text-white">{value}</span>
      <span className="text-xs font-mono text-zinc-500">{unit}</span>
    </div>
  </motion.div>
);

const DashboardPage: React.FC = () => {
  const { address, isConnected } = useAccount();

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

  const { data: rewardRate } = useReadContract({
    address: ADRS.staking as `0x${string}`,
    abi: MINIMAL_STAKING_ABI,
    functionName: 'rewardRate',
    query: { refetchInterval: 10000 }
  });

  if (!isConnected) {
    return (
      <div className="relative flex flex-col items-center justify-center min-h-[70vh] text-center overflow-hidden">
        <HeroScene />
        <div className="relative z-10 p-8 bg-black/40 backdrop-blur-xl rounded-3xl border border-zinc-800">
          <div className="w-20 h-20 bg-zinc-900 mx-auto rounded-full flex items-center justify-center mb-6 border border-zinc-800">
            <Info size={32} className="text-zinc-500" />
          </div>
          <h2 className="text-2xl font-black mb-2 uppercase tracking-tighter">Connection Required</h2>
          <p className="text-zinc-500 max-w-sm font-mono text-xs leading-relaxed uppercase tracking-widest">
            Please connect your ritual terminal to access the MeeChain ecosystem.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative space-y-8 min-h-[80vh]">
      {/* Background 3D Effect */}
      <div className="fixed inset-0 pointer-events-none opacity-40">
        <HeroScene />
      </div>

      <header className="relative z-10">
        <h1 className="text-4xl font-black tracking-tighter uppercase mb-2 italic">System Overview</h1>
        <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.2em]">Real-time telemetry from the MeeChain network</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        <StatCard 
          title="MEE Balance" 
          value={tokenBalance ? parseFloat(formatUnits(tokenBalance, 18)).toFixed(2) : "0.00"} 
          unit="MEE" 
          icon={Coins} 
          color="text-yellow-500"
        />
        <StatCard 
          title="Collection" 
          value={nftBalance?.toString() || "0"} 
          unit="Bots" 
          icon={Layers} 
          color="text-blue-500"
        />
        <StatCard 
          title="Network Rewards" 
          value={rewardRate ? formatUnits(rewardRate, 18) : "0"} 
          unit="MEE/SEC" 
          icon={TrendingUp} 
          color="text-green-500"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 relative z-10 overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10">
           <Zap size={120} />
        </div>
        
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center text-yellow-500">
            <Zap size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold uppercase tracking-tight">Active Terminal</h3>
            <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest">{address}</p>
          </div>
        </div>
        <div className="h-[1px] bg-zinc-800 w-full mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-[10px] text-zinc-500 font-mono uppercase mb-1">Status</p>
            <p className="text-xs font-bold text-green-500 uppercase">Synchronized</p>
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 font-mono uppercase mb-1">Latency</p>
            <p className="text-xs font-bold text-white uppercase">12ms</p>
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 font-mono uppercase mb-1">Network</p>
            <p className="text-xs font-bold text-white uppercase">MeeChain-1337</p>
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 font-mono uppercase mb-1">Node</p>
            <p className="text-xs font-bold text-white uppercase">Primary RPC</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
