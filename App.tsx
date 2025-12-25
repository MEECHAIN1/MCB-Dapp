
import React, { useEffect, useState } from 'react';
import { WagmiProvider, useAccount, useChainId } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '@/lib/wagmiConfig';
import { StatusOverlay } from './components/StatusOverlay';
import { Navbar } from './components/Navbar';
import { RitualOracle } from './components/RitualOracle';
import { StartupLoader } from './components/StartupLoader';
import DashboardPage from '@/pages/DashboardPage';
import StakingPage from '@/pages/StakingPage';
import GalleryPage from '@/pages/GalleryPage';
import EventLogPage from '@/pages/EventLogPage';
import MarketplacePage from '@/pages/MarketplacePage';
import MintPage from '@/pages/MintPage';
import MiningPage from '@/pages/MiningPage';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useAppState } from '@/context/useAppState';
import { AnimatePresence } from 'framer-motion';

const queryClient = new QueryClient();
const TARGET_CHAIN_ID = Number(import.meta.env.VITE_CHAIN_ID || 1337); 

const GlobalManager: React.FC = () => {
  const { pathname } = useLocation();
  const { isConnected } = useAccount();
  const currentChainId = useChainId();
  const { setError, reset } = useAppState();

  useEffect(() => {
    reset();
  }, [pathname, reset]);

  useEffect(() => {
    if (isConnected && currentChainId !== TARGET_CHAIN_ID) {
      setError(`Network Mismatch: โปรดสลับเครือข่ายไปที่ MeeChain (ID: ${TARGET_CHAIN_ID})`);
    } else {
      setError(undefined); // ล้าง Error เมื่อ Network ถูกต้อง
    }
  }, [isConnected, currentChainId, setError]);

  return null;
};

const App: React.FC = () => {
  const [isAppLoaded, setIsAppLoaded] = useState(false);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AnimatePresence>
            {!isAppLoaded && (
              <StartupLoader onComplete={() => setIsAppLoaded(true)} />
            )}
          </AnimatePresence>
          
          <GlobalManager />
          <div className={`min-h-screen bg-black text-white selection:bg-yellow-500/30 font-sans transition-opacity duration-1000 ${isAppLoaded ? 'opacity-100' : 'opacity-0'}`}>
            <Navbar />
            <main className="pt-24 pb-12 max-w-7xl mx-auto px-6">
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/mint" element={<MintPage />} />
                <Route path="/mining" element={<MiningPage />} />
                <Route path="/staking" element={<StakingPage />} />
                <Route path="/gallery" element={<GalleryPage />} />
                <Route path="/marketplace" element={<MarketplacePage />} />
                <Route path="/events" element={<EventLogPage />} />
              </Routes>
            </main>
            <RitualOracle />
            <StatusOverlay />
          </div>
        </Router>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default App;
