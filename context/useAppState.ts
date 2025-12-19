
import { create } from 'zustand';

interface AppState {
  isLoading: boolean;
  error: string | null;
  txHash: string | null;
  ritualSuccess: boolean;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setTxHash: (hash: string | null) => void;
  triggerSuccess: () => void;
  reset: () => void;
}

export const useAppState = create<AppState>((set) => ({
  isLoading: false,
  error: null,
  txHash: null,
  ritualSuccess: false,
  setLoading: (loading) => set({ isLoading: loading, error: null }),
  setError: (error) => set({ error: error, isLoading: false }),
  setTxHash: (hash) => set({ txHash: hash }),
  triggerSuccess: () => {
    set({ ritualSuccess: true, isLoading: false });
    setTimeout(() => set({ ritualSuccess: false }), 5000);
  },
  reset: () => set({ isLoading: false, error: null, txHash: null, ritualSuccess: false }),
}));
