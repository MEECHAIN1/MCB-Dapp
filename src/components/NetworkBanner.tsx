import React from 'react';
import { useAppState } from '../context/AppState';
import { chains } from '../constants/chains';

const NetworkBanner: React.FC = () => {
  const { chainName, chainId, isConnected, setChain } = useAppState();

  const requiredChainId = chains[0].id;

  React.useEffect(() => {
    // keep Zustand in sync (no-op if already set)
    setChain(chainName, chainId);
  }, [chainName, chainId, setChain]);

  if (!isConnected) {
    return (
      <div className="w-full bg-blue-800 text-white text-center py-2 text-sm">
        Connect your wallet to get started!
      </div>
    );
  }

  if (chainId !== requiredChainId) {
    return (
      <div className="w-full bg-yellow-600 text-white text-center py-2 text-sm">
        Incorrect Network: Connected to {chainName || 'Unknown'}. Please switch to {chains[0].name} in your wallet.
      </div>
    );
  }

  return (
    <div className="w-full bg-green-700 text-white text-center py-2 text-sm">
      Connected to {chainName}
    </div>
  );
};

export default NetworkBanner;