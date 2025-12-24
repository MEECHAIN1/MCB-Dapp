import { create } from 'zustand';
import { Address } from 'viem';
import { AppState, ContractEvent } from '../../types';

export const useAppState = create<AppState>((set) => ({
  account: undefined,
  isConnected: false,
  chainName: undefined,
  chainId: undefined,
  nftBalance: "0",
  tokenBalance: "0",
  stakingBalance: "0",
  rewardRate: "0",
  events: [],
  loading: false,
  error: null,

  setAccount: (account) => set({ account }),
  setIsConnected: (connected) => set({ isConnected: connected }),
  setChain: (chainName, chainId) => set({ chainName, chainId }),
  setNftBalance: (balance) => set({ nftBalance: balance }),
  setTokenBalance: (balance) => set({ tokenBalance: balance }),
  setStakingBalance: (balance) => set({ stakingBalance: balance }),
  setRewardRate: (rate) => set({ rewardRate: rate }),
  addEvent: (event) => set((state) => ({ events: [event, ...state.events].slice(0, 100) })), // Keep last 100 events
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  resetState: () => set({
    account: undefined,
    isConnected: false,
    chainName: undefined,
    chainId: undefined,
    nftBalance: "0",
    tokenBalance: "0",
    stakingBalance: "0",
    rewardRate: "0",
    events: [],
    loading: false,
    error: null,
  }),
}));

// This component is a wrapper to provide the Zustand store to the React tree.
// While Zustand doesn't strictly *need* a Provider, it's good practice for clarity
// and to potentially add context-specific setup if needed in the future.
export const AppStateProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  return <>{children}</>
};
