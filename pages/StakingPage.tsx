
import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { ADRS, MINIMAL_STAKING_ABI, MINIMAL_ERC20_ABI } from '../lib/contracts';
import { useAppState } from '../context/useAppState';
import { motion } from 'framer-motion';
import { Wallet, ArrowDownToLine, Gift, Ban } from 'lucide-react';

const StakingPage: React.FC = () => {
  const { address } = useAccount();
  const { setLoading, setError, triggerSuccess, setTxHash } = useAppState();
  const [stakeAmount, setStakeAmount] = useState('');

  // Contract Reads
  const { data: earned, refetch: refetchEarned, isLoading: isEarnedLoading } = useReadContract({
    address: ADRS.staking as `0x${string}`,
    abi: MINIMAL_STAKING_ABI,
    functionName: 'earned',
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 5000 }
  });

  const { data: stakedBalance, refetch: refetchStaked, isLoading: isStakedLoading } = useReadContract({
    address: ADRS.staking as `0x${string}`,
    abi: MINIMAL_STAKING_ABI,
    functionName: 'balanceOf' as any,
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  const { data: allowance, refetch: refetchAllowance, isLoading: isAllowanceLoading } = useReadContract({
    address: ADRS.token as `0x${string}`,
    abi: MINIMAL_ERC20_ABI,
    functionName: 'allowance',
    args: address ? [address, ADRS.staking as `0x${string}`] : undefined,
    query: { enabled: !!address }
  });

  const { writeContractAsync, data: hash, isPending: isWritePending } = useWriteContract();
  
  const { isLoading: isTxLoading, isSuccess: isTxSuccess, isError: isTxError, error: txError } = useWaitForTransactionReceipt({ hash });

  // Sync transaction lifecycle and initial data fetching with global app state
  useEffect(() => {
    setLoading(isTxLoading || isWritePending || isEarnedLoading || isStakedLoading || isAllowanceLoading);
  }, [isTxLoading, isWritePending, isEarnedLoading, isStakedLoading, isAllowanceLoading, setLoading]);

  useEffect(() => {
    if (isTxSuccess) {
      triggerSuccess();
      setLoading(false);
      refetchEarned();
      refetchAllowance();
      refetchStaked?.();
      setStakeAmount('');
    }
  }, [isTxSuccess, triggerSuccess, setLoading, refetchEarned, refetchAllowance, refetchStaked]);

  useEffect(() => {
    if (isTxError && txError) {
      setError(txError.message);
    }
  }, [isTxError, txError, setError]);

  const handleAction = async (type: 'stake' | 'claim' | 'withdraw' | 'approve') => {
    if (!address) return;
    setLoading(true);
    try {
      let resultHash;
      if (type === 'approve') {
        resultHash = await writeContractAsync({
          address: ADRS.token as `0x${string}`,
          abi: MINIMAL_ERC20_ABI,
          functionName: 'approve',
          args: [ADRS.staking as `0x${string}`, parseUnits(stakeAmount || '1000000000', 18)],
        });
      } else if (type === 'stake') {
        resultHash = await writeContractAsync({
          address: ADRS.staking as `0x${string}`,
          abi: MINIMAL_STAKING_ABI,
          functionName: 'stake',
          args: [parseUnits(stakeAmount, 18)],
        });
      } else if (type === 'claim') {
        resultHash = await writeContractAsync({
          address: ADRS.staking as `0x${string}`,
          abi: MINIMAL_STAKING_ABI,
          functionName: 'getReward',
        });
      } else if (type === 'withdraw') {
        resultHash = await writeContractAsync({
          address: ADRS.staking as `0x${string}`,
          abi: MINIMAL_STAKING_ABI,
          functionName: 'withdraw',
          args: [stakedBalance || 0n] as any,
        });
      }
      setTxHash(resultHash || null);
    } catch (err: any) {
      setError(err.shortMessage || err.message);
      setLoading(false);
    }
  };

  const needsApproval = stakeAmount && allowance !== undefined && allowance < parseUnits(stakeAmount, 18);

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <header className="text-center">
        <h1 className="text-5xl font-black tracking-tighter uppercase mb-4 italic">The Staking Ritual</h1>
        <p className="text-zinc-500 font-mono text-sm uppercase tracking-[0.3em]">Sacrifice tokens to receive the MCB blessing</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Stake Panel */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 flex flex-col gap-6">
          <div>
            <h3 className="text-xl font-bold uppercase tracking-tight flex items-center gap-2">
              <ArrowDownToLine className="text-yellow-500" />
              Sacrifice MCB
            </h3>
            <p className="text-zinc-500 font-mono text-[10px] uppercase mt-1">Enhance your nexus influence</p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest ml-1">Tokens to Stake</label>
            <div className="relative">
              <input 
                type="number" 
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-black border border-zinc-800 rounded-xl p-4 font-mono text-xl focus:border-yellow-500 focus:outline-none transition-colors"
              />
              <button className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-yellow-500 uppercase hover:text-yellow-400">MAX</button>
            </div>
          </div>

          {needsApproval ? (
            <button 
              onClick={() => handleAction('approve')}
              className="w-full bg-zinc-100 text-black py-4 rounded-xl font-black uppercase tracking-widest hover:bg-white transition-all disabled:opacity-50"
            >
              Authorize MCB Flow
            </button>
          ) : (
            <button 
              disabled={!stakeAmount || parseFloat(stakeAmount) <= 0 || isWritePending}
              onClick={() => handleAction('stake')}
              className="w-full bg-yellow-500 text-black py-4 rounded-xl font-black uppercase tracking-widest hover:bg-yellow-400 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(234,179,8,0.2)]"
            >
              Initiate Stake
            </button>
          )}
        </div>

        {/* Rewards Panel */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold uppercase tracking-tight flex items-center gap-2">
              <Gift className="text-green-500" />
              Manifested
            </h3>
            <p className="text-zinc-500 font-mono text-[10px] uppercase mt-1">Pending blessings from the Nexus</p>
          </div>

          <div className="py-8 text-center">
            <p className="text-5xl font-black text-white mb-2">
              {earned ? parseFloat(formatUnits(earned, 18)).toFixed(4) : "0.0000"}
            </p>
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-[0.2em]">MCB Rewards Earned</p>
          </div>

          <button 
            disabled={!earned || earned === 0n || isWritePending}
            onClick={() => handleAction('claim')}
            className="w-full border-2 border-green-500/50 text-green-500 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-green-500 hover:text-black transition-all disabled:opacity-30 disabled:border-zinc-800 disabled:text-zinc-700"
          >
            Claim Blessing
          </button>
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Ban className="text-red-500" />
          <div className="text-left">
            <h4 className="text-xs font-bold uppercase">Exit Nexus</h4>
            <p className="text-[10px] text-zinc-500 font-mono uppercase">Recover your MCB assets</p>
          </div>
        </div>
        <button 
          onClick={() => handleAction('withdraw')}
          className="text-zinc-400 hover:text-white font-mono text-xs uppercase underline tracking-widest transition-colors"
        >
          Withdraw All
        </button>
      </div>
    </div>
  );
};

export default StakingPage;
