import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import NetworkBanner from './components/NetworkBanner';
import DashboardPage from './pages/DashboardPage';
import TailwindTestPage from './pages/TailwindTestPage';
import EventLogPage from './pages/EventLogPage';
import GalleryPage from './pages/GalleryPage';
import StakingPage from './pages/StakingPage';
import { useAppState } from './context/AppState';
import { publicClient } from '../lib/viemClient';
import { watchNftEvents } from '../lib/services/nft';
import { watchStakingEvents } from '../lib/services/staking';
import { watchTokenEvents } from '../lib/services/tokenEvents'; // New file for token events

// This component will house event watching
const EventWatcher: React.FC = () => {
  const { addEvent } = useAppState(); // Changed from addEventLog

  React.useEffect(() => {
    // Watch NFT events
    const unwatchNft = watchNftEvents(publicClient, addEvent); // Changed from addEventLog

    // Watch Staking events
    const unwatchStaking = watchStakingEvents(publicClient, addEvent); // Changed from addEventLog

    // Watch Token events
    const unwatchToken = watchTokenEvents(publicClient, addEvent); // Changed from addEventLog

    // Cleanup watches on component unmount
    return () => {
      unwatchNft();
      unwatchStaking();
      unwatchToken();
    };
  }, [addEvent]); // Changed from addEventLog

  return null; // This component doesn't render anything visible
};

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col">
      <NetworkBanner />
      <Navbar />
      <main className="flex-grow py-8">
        <EventWatcher /> {/* Integrate the event watcher */}
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/tailwind-test" element={<TailwindTestPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/staking" element={<StakingPage />} />
          <Route path="/events" element={<EventLogPage />} />
          {/* Add a fallback route for unmatched paths */}
          <Route path="*" element={<h2 className="text-white text-3xl text-center">404 - Page Not Found</h2>} />
        </Routes>
      </main>
      <footer className="p-4 text-center text-slate-500 text-sm">
        &copy; {new Date().getFullYear()} MeeChain MeeBot DApp. All rights reserved.
      </footer>
    </div>
  );
};

export default App;