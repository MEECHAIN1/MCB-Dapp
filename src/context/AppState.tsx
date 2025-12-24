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
  
  initiateManualRitual: async () => {
    const { language } = get();
    set({ isLoading: true, error: null, txHash: null });
    
    try {
      // 🔮 1. ส่งคำขอทำพิธีขุดไปยัง MeeChain
      const hash = await writeContract(config, {
        address: ADRS.miner as `0x${string}`,
        abi: MINIMAL_MINER_ABI,
        functionName: 'ritualMint',
      });

      set({ txHash: hash });

      // ⏳ 2. รอการยืนยันบล็อก
      await waitForTransactionReceipt(config, { hash });

      // 🎉 3. สำเร็จ!
      get().triggerSuccess();
      
    } catch (err: any) {
      console.error("Ritual Failed:", err);
      set({ 
        error: err.shortMessage || (language === 'EN' ? "Energy flux failure: Ritual failed" : "กระแสพลังงานขัดข้อง: พิธีกรรมล้มเหลว"), 
        isLoading: false 
      });
    }
  },

  reset: () => set({ isLoading: false, error: null, txHash: null, ritualSuccess: false }),
}));
