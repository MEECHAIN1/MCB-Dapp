
import { createConfig, http } from 'wagmi';
import { localhost } from 'viem/chains';

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

export const config = createConfig({
  chains: [meeChain],
  transports: {
    [meeChain.id]: http(),
  },
});
