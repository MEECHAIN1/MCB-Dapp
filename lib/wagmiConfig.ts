import { createConfig, http } from 'wagmi';
import { localhost } from 'viem/chains';
import { injected } from 'wagmi/connectors';

const getEnvValue = (key: string, fallback: string): string => {
  try {
    const win = window as any;
    if (win.import.meta?.env?.[key]) return win.import.meta.env[key];
  } catch (e) {}
  return fallback;
};

const chainId = Number(getEnvValue('VITE_CHAIN_ID', '56'));
const rpcUrl = getEnvValue('VITE_RPC_URL', 'https://dimensional-newest-film.bsc.quiknode.pro/8296e7105d470d5d73b51b19556495493c8f1033');

const meeChain = {
  ...localhost,
  id: chainId,
  name: getEnvValue('VITE_CHAIN_NAME', 'BSC'),
  nativeCurrency: { name: 'MeeChain', symbol: 'MCB', decimals: 18 },
  rpcUrls: {
    default: { http: [rpcUrl] },
    public: { http: [rpcUrl] },
  },
  blockExplorers: {
    default: { name: 'BscScan', url: getEnvValue('VITE_EXPLORER_URL', 
'https://bscscan.com') },
  },
};

export const config = createConfig({
  chains: [meeChain],
  connectors: [
    injected(),
    walletConnect({ projectId: getEnvValue('VITE_WALLETCONNECT_ID', 'b0d81328f8ab0541fdede7db9ff25cb1') }),
],
  transports: {
   [meeChain.id]: http(rpcUrl),
  },
});

export const getDefaultConfig = (params: any) => config;
