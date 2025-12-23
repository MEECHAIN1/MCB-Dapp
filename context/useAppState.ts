
import { create } from 'zustand';

export type Language = 'EN' | 'TH';

interface AppState {
  isLoading: boolean;
  error: string | null;
  txHash: string | null;
  ritualSuccess: boolean;
  language: Language;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setTxHash: (hash: string | null) => void;
  triggerSuccess: () => void;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  reset: () => void;
}

export const useAppState = create<AppState>((set) => ({
  isLoading: false,
  error: null,
  txHash: null,
  ritualSuccess: false,
  language: 'EN',
  setLoading: (loading) => set({ isLoading: loading, error: null }),
  setError: (error) => set({ error: error, isLoading: false }),
  setTxHash: (hash) => set({ txHash: hash }),
  triggerSuccess: () => {
    set({ ritualSuccess: true, isLoading: false });
    setTimeout(() => set({ ritualSuccess: false }), 5000);
  },
  setLanguage: (lang) => set({ language: lang }),
  toggleLanguage: () => set((state) => ({ language: state.language === 'EN' ? 'TH' : 'EN' })),
  reset: () => set({ isLoading: false, error: null, txHash: null, ritualSuccess: false }),
}));
