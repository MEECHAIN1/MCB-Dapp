import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { writeContract, waitForTransactionReceipt, switchChain } from 'wagmi/core';
import { ADRS, MINIMAL_MINER_ABI } from '../lib/contracts';
import { config } from '../lib/wagmiConfig';
import { canAffordGas } from '../lib/gas';
import { formatUnits } from 'viem';

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
  executeRitual: (action: () => Promise<`0x${string}`>, options?: { to: `0x${string}`, data?: `0x${string}`, value?: bigint }) => Promise<void>;
  initiateManualRitual: (address?: `0x${string}`) => Promise<void>;
  handleSwitchNetwork: () => Promise<void>;
  reset: () => void;
}

const getTargetChainId = () => {
  const win = window as any;
  return Number(win.process?.env?.VITE_CHAIN_ID || 56);
};

export const useAppState = create<AppState>()(
  persist(
    (set, get) => ({
      isLoading: false,
      error: null,
      txHash: null,
      ritualSuccess: false,
      language: 'TH',
      setLoading: (loading) => set({ isLoading: loading, error: null }),
      setError: (error) => set({ error: error, isLoading: false }),
      setTxHash: (hash) => set({ txHash: hash }),
      triggerSuccess: () => {
        set({ ritualSuccess: true, isLoading: false, txHash: null });
        setTimeout(() => set({ ritualSuccess: false }), 8000);
      },
      setLanguage: (lang) => set({ language: lang }),
      toggleLanguage: () => set((state) => ({ language: state.language === 'EN' ? 'TH' : 'EN'})),
      
      executeRitual: async (action, options) => {
        const { language, triggerSuccess } = get();
        set({ isLoading: true, error: null, txHash: null, ritualSuccess: false });
        
        try {
          // Pre-flight gas check
          if (options && options.to) {
            const connections = (config as any).state?.connections;
            const mainId = (config as any).state?.main?.id;
            const account = connections?.get(mainId)?.accounts?.[0];

            if (account) {
              const gasCheck = await canAffordGas({ 
                from: account, 
                to: options.to, 
                data: options.data, 
                value: options.value 
              });
              
              if (!gasCheck.ok) {
                const needed = formatUnits(gasCheck.required, 18);
                const has = formatUnits(gasCheck.balance, 18);
                throw new Error(language === 'TH' 
                  ? `Insufficient MCB for Ritual. Needed: ${needed}, No Have: ${has}` 
                  : `MCB ไม่เพียงพอสำหรับพิธีกรรม ต้องการ: ${needed}, ไม่มี: ${has}`
                );
              }
            }
          }

          const hash = await action();
          set({ txHash: hash });
          await waitForTransactionReceipt(config, { hash });
          triggerSuccess();
        } catch (err: any) {
          console.error("Ritual Execution Error:", err);
          const msg = err.shortMessage || err.message || (language === 'EN' ? "Nexus connection failure" : "การเชื่อมต่อเน็กซัสล้มเหลว");
          set({ error: msg, isLoading: false });
          throw err;
        }
      },

      handleSwitchNetwork: async () => {
        try {
          await switchChain(config, { chainId: getTargetChainId() });
          set({ error: null });
        } catch (err: any) {
          console.error("Dimension switch failed:", err);
          set({ error: "Dimensional Breach: Could not switch to MeeChain. Please try manually in your wallet." });
        }
      },

      initiateManualRitual: async (address) => {
        return get().executeRitual(
          () => writeContract(config, {
            address: ADRS.miner as `0x${string}`,
            abi: MINIMAL_MINER_ABI,
            functionName: 'ritualMint',
          }),
          { to: ADRS.miner as `0x${string}` }
        );
      },

      reset: () => set({ isLoading: false, error: null, txHash: null, ritualSuccess: false }),
    }),
    {
      name: 'meebot-ritual-state-v2',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ txHash: state.txHash, language: state.language }),
    }
  )
);