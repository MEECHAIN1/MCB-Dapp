
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAccount, useConnect, useDisconnect, useChainId } from 'wagmi';
import { Wallet, LogOut, ShieldCheck, Zap, Terminal } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const currentChainId = useChainId();
  
  const targetChainId = Number((import.meta as any).env?.VITE_CHAIN_ID || 1337);
  const isCorrectNetwork = currentChainId === targetChainId;

  const activeStyle = "text-yellow-500 border-b-2 border-yellow-500 pb-1";
  const inactiveStyle = "text-zinc-400 hover:text-white transition-colors";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center text-black shadow-[0_0_15px_rgba(234,179,8,0.4)]">
            <Zap fill="currentColor" size={24} />
          </div>
          <div>
            <span className="font-black text-xl tracking-tighter">MEECHAIN</span>
            <span className="block text-[8px] text-yellow-500 font-mono tracking-[0.3em] uppercase -mt-1">Ritual Terminal</span>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-8 font-mono text-xs uppercase tracking-widest">
          <NavLink to="/" className={({ isActive }) => isActive ? activeStyle : inactiveStyle}>Dashboard</NavLink>
          <NavLink to="/staking" className={({ isActive }) => isActive ? activeStyle : inactiveStyle}>Ritual Stake</NavLink>
          <NavLink to="/gallery" className={({ isActive }) => isActive ? activeStyle : inactiveStyle}>MEE Gallery</NavLink>
          <NavLink to="/events" className={({ isActive }) => isActive ? activeStyle : inactiveStyle}>Ritual Logs</NavLink>
        </div>

        <div className="flex items-center gap-4">
          {isConnected && (
            <div className="hidden sm:flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 rounded-full px-3 py-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${isCorrectNetwork ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-tighter">
                {isCorrectNetwork ? 'MeeChain-1337' : 'Wrong Network'}
              </span>
            </div>
          )}

          {isConnected ? (
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 rounded-full px-4 py-2 shadow-inner">
              <ShieldCheck size={14} className="text-green-500" />
              <span className="text-[10px] font-mono text-zinc-300">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
              <button 
                onClick={() => disconnect()} 
                className="ml-2 text-zinc-500 hover:text-red-500 transition-colors"
                title="Disconnect Ritual"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => connect({ connector: connectors[0] })}
              className="bg-yellow-500 text-black px-5 py-2 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-yellow-400 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(234,179,8,0.2)]"
            >
              <Wallet size={16} />
              Connect Ritual
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
