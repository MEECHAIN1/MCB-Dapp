import React, { useEffect, useState, useMemo } from 'react';
import { WagmiProvider, useAccount, useChainId } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from './lib/wagmiConfig';
import { StatusOverlay } from './components/StatusOverlay';
import { Navbar } from './components/Navbar';
import { RitualOracle } from './components/RitualOracle';
import { StartupLoader } from './components/StartupLoader';
import DashboardPage from './pages/DashboardPage';
import StakingPage from './pages/StakingPage';
import GalleryPage from './pages/GalleryPage';
import EventLogPage from './pages/EventLogPage';
import MarketplacePage from './pages/MarketplacePage';
import MintPage from './pages/MintPage';
import MiningPage from './pages/MiningPage';
import { HashRouter, as Routes, Route, useLocation } from 'react-router-dom';
import { useAppState } from './context/useAppState';
import { AnimatePresence, motion } from 'framer-motion';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const GlobalManager: React.FC = () => {
  const { pathname } = useLocation();
  const { isConnected } = useAccount();
  const currentChainId = useChainId();
  const { setError, reset } = useAppState();
  
  const targetChainId = useMemo(() => {
    const win = window as any;
    return Number(win.process?.env?.VITE_CHAIN_ID || 1337);
  }, []);

  useEffect(() => {
    reset();
  }, [pathname, reset]);

  useEffect(() => {
    if (isConnected && currentChainId !== targetChainId) {
      setError(`Network Mismatch: Please connect to the ritual chain (Chain ID: ${targetChainId})`);
    }
  }, [isConnected, currentChainId, targetChainId, setError]);

  return null;
};

const App: React.FC = () => {
  const [isAppLoaded, setIsAppLoaded] = useState(false);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AnimatePresence mode="wait">
            {!isAppLoaded && (
              <StartupLoader key="loader" onComplete={() => setIsAppLoaded(true)} />
            )}
          </AnimatePresence>
          
          <GlobalManager />
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: isAppLoaded ? 1 : 0 }}
            transition={{ duration: 1 }}
            className="min-h-screen bg-black text-white selection:bg-yellow-500/30 font-sans"
          >
            {isAppLoaded && (
              <>
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
              </>
            )}
          </motion.div>
        </Router>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default App;
