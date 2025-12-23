
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAccount, useConnect, useDisconnect, useChainId } from 'wagmi';
import { Wallet, LogOut, ShieldCheck, Zap, Languages, Pickaxe } from 'lucide-react';
import { useAppState } from '../context/useAppState';
import { motion } from 'framer-motion';

export const Navbar: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const currentChainId = useChainId();
  const { language, toggleLanguage } = useAppState();
  
  const targetChainId = Number((import.meta as any).env?.VITE_CHAIN_ID || 1337);
  const isCorrectNetwork = currentChainId === targetChainId;

  const activeStyle = "text-yellow-500 border-b-2 border-yellow-500 pb-1";
  const inactiveStyle = "text-zinc-400 hover:text-white transition-colors";

  const translations = {
    EN: {
      dashboard: "Dashboard",
      staking: "Ritual Stake",
      marketplace: "Nexus Market",
      gallery: "Gallery",
      forge: "The Forge",
      mining: "Energy Mine",
      logs: "Logs",
      identify: "Identify Ritualist"
    },
    TH: {
      dashboard: "แดชบอร์ด",
      staking: "การสเตก",
      marketplace: "ตลาดเน็กซัส",
      gallery: "แกลเลอรี",
      forge: "โรงตีเหล็ก",
      mining: "ขุดพลังงาน",
      logs: "ประวัติ",
      identify: "ยืนยันตัวตน"
    }
  };

  const t = translations[language];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center text-black shadow-[0_0_15px_rgba(234,179,8,0.4)]">
            <Zap fill="currentColor" size={24} />
          </div>
          <div>
            <span className="font-black text-xl tracking-tighter uppercase">MeeChain</span>
            <span className="block text-[8px] text-yellow-500 font-mono tracking-[0.3em] uppercase -mt-1">MCB Ritual Terminal</span>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-8 font-mono text-xs uppercase tracking-widest">
          <NavLink to="/" className={({ isActive }) => isActive ? activeStyle : inactiveStyle}>{t.dashboard}</NavLink>
          <NavLink to="/mining" className={({ isActive }) => isActive ? activeStyle : inactiveStyle}>{t.mining}</NavLink>
          <NavLink to="/mint" className={({ isActive }) => isActive ? activeStyle : inactiveStyle}>{t.forge}</NavLink>
          <NavLink to="/staking" className={({ isActive }) => isActive ? activeStyle : inactiveStyle}>{t.staking}</NavLink>
          <NavLink to="/marketplace" className={({ isActive }) => isActive ? activeStyle : inactiveStyle}>{t.marketplace}</NavLink>
          <NavLink to="/gallery" className={({ isActive }) => isActive ? activeStyle : inactiveStyle}>{t.gallery}</NavLink>
          <NavLink to="/events" className={({ isActive }) => isActive ? activeStyle : inactiveStyle}>{t.logs}</NavLink>
        </div>

        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleLanguage}
            className="flex items-center gap-2 bg-zinc-900/80 border border-zinc-700 hover:border-yellow-500/50 px-3 py-1.5 rounded-full transition-all group"
          >
            <Languages size={14} className="text-zinc-500 group-hover:text-yellow-500 transition-colors" />
            <span className="text-[10px] font-mono font-bold text-zinc-300 group-hover:text-white uppercase tracking-tighter">
              {language}
            </span>
          </motion.button>

          {isConnected && (
            <div className="hidden sm:flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 rounded-full px-3 py-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${isCorrectNetwork ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-tighter">
                {isCorrectNetwork ? 'MeeChain-Ritual' : 'Wrong Network'}
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
              {t.identify}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
