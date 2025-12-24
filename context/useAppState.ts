
import { create } from 'zustand';
import { writeContract, waitForTransactionReceipt } from '@wagmi/core';
import { config } from '../lib/wagmiConfig';
import { ADRS, MINIMAL_MINER_ABI } from '../lib/contracts';

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
  executeRitual: (action: () => Promise<`0x${string}`>) => Promise<void>;
  initiateManualRitual: () => Promise<void>;
  reset: () => void;
}

export const useAppState = create<AppState>((set, get) => ({
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
  
  executeRitual: async (action) => {
    const { language, triggerSuccess } = get();
    set({ isLoading: true, error: null, txHash: null, ritualSuccess: false });
    
    try {
      const hash = await action();
      set({ txHash: hash });
      
      // Wait for block confirmation
      await waitForTransactionReceipt(config, { hash });
      triggerSuccess();
    } catch (err: any) {
      console.error("Ritual Execution Error:", err);
      // Extract human-readable error or use localized fallback
      const msg = err.shortMessage || err.message || (language === 'EN' ? "Nexus connection failure" : "การเชื่อมต่อเน็กซัสล้มเหลว");
      set({ error: msg, isLoading: false });
      // We throw to allow local components to handle secondary UI logic if needed
      throw err;
    }
  },

  initiateManualRitual: async () => {
    return get().executeRitual(() => 
      writeContract(config, {
        address: ADRS.miner as `0x${string}`,
        abi: MINIMAL_MINER_ABI,
        functionName: 'ritualMint',
      })
    );
  },

  reset: () => set({ isLoading: false, error: null, txHash: null, ritualSuccess: false }),
}));
