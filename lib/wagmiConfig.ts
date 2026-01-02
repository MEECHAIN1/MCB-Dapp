import { createConfig, http } from 'wagmi';
import { localhost } from 'viem/chains';
import { injected } from 'wagmi/connectors';

// Safely access environment variables from the window.process.env initialized in index.html
const getEnvValue = (key: string, fallback: string): string => {
  try {
    const win = window as any;
    if (win.process?.env?.[key]) return win.process.env[key];
  } catch (e) {}
  return fallback;
};

const chainId = Number(getEnvValue('VITE_CHAIN_ID', '56'));
const rpcUrl = getEnvValue('VITE_RPC_URL', 'https://bscscan.com');

const meeChain = {
  ...localhost,
  id: chainId,
  name: getEnvValue('VITE_CHAIN_NAME', 'BCS'),
  nativeCurrency: { name: 'MeeChain', symbol: 'MCB', decimals: 18 },
  rpcUrls: {
    default: { http: [rpcUrl] },
    public: { http: [rpcUrl] },
  },
  blockExplorers: {
    default: { name: 'BcsScan', url: getEnvValue('VITE_EXPLORER_URL', 'https://bscscan.com') },
  },
};

export const config = createConfig({
  chains: [meeChain],
  connectors: [
    injected(),
  ],
  transports: {
    [meeChain.id]: http(rpcUrl),
  },
});