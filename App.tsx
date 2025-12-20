
import React, { useEffect } from 'react';
import { createConfig, http, WagmiProvider, useAccount, useChainId } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { localhost } from 'viem/chains';
import { StatusOverlay } from './components/StatusOverlay';
import { Navbar } from './components/Navbar';
import DashboardPage from './pages/DashboardPage';
import StakingPage from './pages/StakingPage';
import GalleryPage from './pages/GalleryPage';
import EventLogPage from './pages/EventLogPage';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useAppState } from './context/useAppState';

// Fix: Use type assertion for import.meta.env to resolve TS errors when Vite types are not detected
const chainId = Number((import.meta as any).env?.VITE_CHAIN_ID || 1337);
const rpcUrl = (import.meta as any).env?.VITE_RPC_URL || 'http://127.0.0.1:9545';

const meeChain = {
  ...localhost,
  id: chainId,
  name: (import.meta as any).env?.VITE_CHAIN_NAME || 'MeeChain',
  rpcUrls: {
    default: { http: [rpcUrl] },
    public: { http: [rpcUrl] },
  },
};

const config = createConfig({
  chains: [meeChain],
  transports: {
    [meeChain.id]: http(),
  },
});

const queryClient = new QueryClient();

/**
 * GlobalManager handles app-wide logic that requires being inside
 * the Wagmi and Router contexts.
 */
const GlobalManager: React.FC = () => {
  const { pathname } = useLocation();
  const { isConnected } = useAccount();
  const currentChainId = useChainId();
  const { setError, reset } = useAppState();

  // Reset error state whenever the user navigates to a different page
  useEffect(() => {
    reset();
  }, [pathname, reset]);

  // Check for network mismatch and notify the user via global state
  useEffect(() => {
    if (isConnected && currentChainId !== chainId) {
      setError(`Network Mismatch: Please connect to the ritual chain (Chain ID: ${chainId})`);
    }
  }, [isConnected, currentChainId, setError]);

  return null;
};

const App: React.FC = () => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <GlobalManager />
          <div className="min-h-screen bg-black text-white selection:bg-yellow-500/30 font-sans">
            <Navbar />
            <main className="pt-24 pb-12 max-w-7xl mx-auto px-6">
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/staking" element={<StakingPage />} />
                <Route path="/gallery" element={<GalleryPage />} />
                <Route path="/events" element={<EventLogPage />} />
              </Routes>
            </main>
            <StatusOverlay />
          </div>
        </Router>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default App;
