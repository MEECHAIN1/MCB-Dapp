import { createConfig, http } from 'wagmi';
import { bsc } from 'viem/chains';
import { injected, walletConnect } from 'wagmi/connectors';

// Safely access environment variables from the window.process.env initialized in index.html
const getEnvValue = (key: string, fallback: string): string => {
  try {
    const win = window as any;
    let val = (win.process?.env?.[key]) || fallback;
    if (typeof val !== 'string') val = String(val || fallback);
    return val || fallback;
  } catch (e) {
    return fallback;
  }
};

// Strict parsing for chain ID and URLs
const chainId = parseInt(getEnvValue('VITE_CHAIN_ID', '56'), 10) || 56;
const rpcUrl = getEnvValue('VITE_RPC_URL', 'https://dimensional-newest-film.bsc.quiknode.pro/8296e7105d470d5d73b51b19556495493c8f1033');
const explorerUrl = getEnvValue('VITE_EXPLORER_URL', 'https://bscscan.com');
const chainName = getEnvValue('VITE_CHAIN_NAME', 'BSC Ritual Node');
const walletConnectProjectId = getEnvValue('VITE_WALLETCONNECT_PROJECT_ID', '3a8170812b1a5e812d8a9e73950f1406');

const targetChain = {
  ...bsc,
  id: chainId,
  name: chainName,
  rpcUrls: {
    default: { http: [rpcUrl] },
    public: { http: [rpcUrl] },
  },
  blockExplorers: {
    default: { name: 'BscScan', url: explorerUrl },
  },
};

export const config = createConfig({
  chains: [targetChain],
  connectors: [
    injected(),
    ...(walletConnectProjectId ? [walletConnect({ projectId: walletConnectProjectId })] : []),
  ],
  transports: {
    [targetChain.id]: http(rpcUrl),
  },
});