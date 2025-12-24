import React from 'react';
import { useAppState } from '../context/AppState';
import celebration from './AudioCelebration';

// Lightweight wallet connect simulator for local/dev environments.
// This avoids depending on `wagmi` providers at runtime while keeping UI flows usable.
const WalletConnectButton: React.FC = () => {
  const { account, isConnected, chainName, setAccount, setIsConnected, setChain, resetState } = useAppState();

  React.useEffect(() => {
    // No-op: in a real app, we'd sync wagmi state -> Zustand here.
  }, []);

  const handleConnect = () => {
    const addr = window.prompt('Enter a wallet address to simulate connection (0x...)');
    if (addr) {
      setAccount(addr as any);
      setIsConnected(true);
      setChain('LocalSimulatedChain', 1337);
      try { celebration(); } catch {}
    }
  };

  const handleDisconnect = () => {
    resetState();
  };

  if (isConnected) {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-slate-300">
          Connected: {(account || '').toString().slice(0, 6)}...{(account || '').toString().slice(-4)}
        </span>
        <button
          onClick={handleDisconnect}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button onClick={handleConnect} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg">
      Connect Wallet (simulate)
    </button>
  );
};

export default WalletConnectButton;