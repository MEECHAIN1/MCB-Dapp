
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAccount, useConnect, useDisconnect, useChainId } from 'wagmi';
import { 
  Wallet, LogOut, ShieldCheck, Zap, Languages, 
  Menu, X, LayoutDashboard, Pickaxe, Hammer, 
  Gift, ShoppingCart, Image as ImageIcon, ScrollText, 
  RefreshCcw, Smartphone
} from 'lucide-react';
import { useAppState } from '../context/useAppState';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const currentChainId = useChainId();
  const { language, toggleLanguage, handleSwitchNetwork } = useAppState();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const targetChainId = Number((window as any).process?.env?.VITE_CHAIN_ID || 1337);
  const isCorrectNetwork = currentChainId === targetChainId;

  const activeStyle = "text-yellow-500 border-b-2 border-yellow-500 pb-1";
  const inactiveStyle = "text-zinc-400 hover:text-white transition-colors";
  
  const mobileActiveStyle = "bg-yellow-500/10 text-yellow-500 border-l-4 border-yellow-500 pl-4 py-4 rounded-r-xl";
  const mobileInactiveStyle = "text-zinc-400 hover:bg-zinc-900/50 pl-4 py-4 rounded-xl transition-all";

  const translations = {
    EN: {
      dashboard: "Dashboard",
      staking: "Ritual Stake",
      marketplace: "Nexus Market",
      gallery: "Gallery",
      forge: "The Forge",
      mining: "Energy Mine",
      logs: "Logs",
      identify: "Identify",
      menu: "Menu"
    },
    TH: {
      dashboard: "แดชบอร์ด",
      staking: "การสเตก",
      marketplace: "ตลาดเน็กซัส",
      gallery: "แกลเลอรี",
      forge: "โรงตีเหล็ก",
      mining: "ขุดพลังงาน",
      logs: "ประวัติ",
      identify: "ยืนยันตัวตน",
      menu: "เมนู"
    }
  };

  const t = translations[language];

  const navLinks = [
    { to: "/", label: t.dashboard, icon: LayoutDashboard },
    { to: "/mining", label: t.mining, icon: Pickaxe },
    { to: "/mint", label: t.forge, icon: Hammer },
    { to: "/staking", label: t.staking, icon: Gift },
    { to: "/marketplace", label: t.marketplace, icon: ShoppingCart },
    { to: "/gallery", label: t.gallery, icon: ImageIcon },
    { to: "/events", label: t.logs, icon: ScrollText },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-black/80 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center text-black shadow-[0_0_15px_rgba(234,179,8,0.4)]">
              <Zap fill="currentColor" size={24} />
            </div>
            <div className="hidden sm:block">
              <span className="font-black text-xl tracking-tighter uppercase">MeeChain</span>
              <span className="block text-[8px] text-yellow-500 font-mono tracking-[0.3em] uppercase -mt-1">Ritual Terminal</span>
            </div>
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6 font-mono text-[10px] uppercase tracking-widest">
            {navLinks.map(link => (
              <NavLink key={link.to} to={link.to} className={({ isActive }) => isActive ? activeStyle : inactiveStyle}>
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleLanguage}
              className="flex items-center gap-2 bg-zinc-900/80 border border-zinc-700 px-3 py-1.5 rounded-full transition-all group"
            >
              <Languages size={14} className="text-zinc-500 group-hover:text-yellow-500 transition-colors" />
              <span className="text-[10px] font-mono font-bold text-zinc-300 group-hover:text-white">
                {language}
              </span>
            </motion.button>

            {isConnected ? (
              <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 rounded-full px-3 sm:px-4 py-2 shadow-inner">
                <ShieldCheck size={14} className="text-green-500" />
                <span className="text-[10px] font-mono text-zinc-300 hidden sm:inline">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
                <button 
                  onClick={() => disconnect()} 
                  className="ml-1 sm:ml-2 text-zinc-500 hover:text-red-500 transition-colors"
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {connectors.map((connector) => (
                  <button 
                    key={connector.id}
                    onClick={() => connect({ connector })}
                    className={`${connector.id === 'walletConnect' ? 'bg-indigo-600 text-white' : 'bg-yellow-500 text-black'} px-3 sm:px-4 py-2 rounded-full font-bold text-[10px] uppercase tracking-widest hover:opacity-90 transition-all flex items-center gap-2`}
                    title={connector.name}
                  >
                    {connector.id === 'walletConnect' ? <Smartphone size={14} /> : <Wallet size={14} />}
                    <span className="hidden sm:inline">
                      {connector.name === 'Injected' ? t.identify : connector.name}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-zinc-400 hover:text-white"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[90] bg-zinc-950 pt-24 pb-8 px-6 lg:hidden flex flex-col"
          >
            <div className="flex flex-col gap-2 overflow-y-auto flex-1">
              <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-[0.5em] mb-4 ml-4">Main Protocols</p>
              {navLinks.map(link => (
                <NavLink 
                  key={link.to} 
                  to={link.to} 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) => isActive ? mobileActiveStyle : mobileInactiveStyle}
                >
                  <div className="flex items-center gap-4">
                    <link.icon size={18} />
                    <span className="font-black text-sm uppercase tracking-wider italic">{link.label}</span>
                  </div>
                </NavLink>
              ))}
            </div>

            <div className="mt-auto border-t border-zinc-900 pt-8 space-y-4">
              {!isCorrectNetwork && isConnected && (
                <button 
                  onClick={() => {
                    handleSwitchNetwork();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full bg-red-500/10 border border-red-500/50 py-4 rounded-2xl flex items-center justify-center gap-3 text-red-400 text-xs font-bold uppercase tracking-widest"
                >
                  <RefreshCcw size={16} className="animate-spin-slow" />
                  Switch to MeeChain
                </button>
              )}
              
              <div className="flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                   <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest italic">Terminal Active</span>
                </div>
                <span className="text-[9px] font-mono text-zinc-700 uppercase tracking-widest">v3.1.4-Mobile</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation Bar (Shortcut) */}
      <div className="fixed bottom-0 left-0 right-0 z-[80] lg:hidden bg-black/90 backdrop-blur-xl border-t border-zinc-800 flex justify-around items-center h-20 px-2 pb-safe">
        {navLinks.slice(0, 5).map(link => {
          const Icon = link.icon;
          return (
            <NavLink 
              key={link.to} 
              to={link.to} 
              className={({ isActive }) => `flex flex-col items-center gap-1.5 transition-all ${isActive ? 'text-yellow-500' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              {({ isActive }) => (
                <>
                  <Icon size={20} className={isActive ? "scale-110" : "scale-100"} />
                  <span className="text-[8px] font-mono uppercase font-bold tracking-tighter">{link.label.split(' ')[0]}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </>
  );
};
