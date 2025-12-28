import { createConfig, http } from 'wagmi';
import { localhost } from 'viem/chains';
import { injected } from 'wagmi/connectors';

const getEnvValue = (key: string, fallback: string): string => {
  try {
    const win = window as any;
    if (win.process?.env?.[key]) return win.process.env[key];
  } catch (e) {}
  return fallback;
};

const chainId = Number(getEnvValue('VITE_CHAIN_ID', '31337'));
const rpcUrl = getEnvValue('VITE_RPC_URL', '127.0.0.1:9545');

const meeChain = {
  ...localhost,
  id: chainId,
  name: getEnvValue('VITE_CHAIN_NAME', 'MeeChain'),
  nativeCurrency: { name: 'MeeChain Bot', symbol: 'MCB', decimals: 18 },
  rpcUrls: {
    default: { http: [rpcUrl] },
    public: { http: [rpcUrl] },
  },
  blockExplorers: {
    default: { name: 'MeeScan', url: getEnvValue('VITE_EXPLORER_URL', 'https://explorer.meechain.io') },
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

export const getDefaultConfig = (params: any) => config;
