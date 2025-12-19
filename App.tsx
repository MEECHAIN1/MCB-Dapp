
import React, { useEffect } from 'react';
import { createConfig, http, WagmiProvider, useAccount, useChainId } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { localhost } from 'viem/chains';
import { StatusOverlay } from './components/StatusOverlay';
import { Navbar } from './components/Navbar';
import DashboardPage from './pages/DashboardPage';
import StakingPage from './pages/StakingPage';
import GalleryPage from './pages/GalleryPage';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useAppState } from './context/useAppState';

const meeChain = {
  ...localhost,
  id: 1337,
  name: 'MeeChain Local',
  rpcUrls: {
    default: { http: ['http://127.0.0.1:9545'] },
    public: { http: ['http://127.0.0.1:9545'] },
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
  const chainId = useChainId();
  const { setError, reset } = useAppState();

  // Reset error state whenever the user navigates to a different page
  useEffect(() => {
    reset();
  }, [pathname, reset]);

  // Check for network mismatch and notify the user via global state
  useEffect(() => {
    if (isConnected && chainId !== 1337) {
      setError("Network Mismatch: Please connect to MeeChain (Chain ID: 1337)");
    }
  }, [isConnected, chainId, setError]);

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
