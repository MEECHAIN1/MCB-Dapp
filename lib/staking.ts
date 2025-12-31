
import { PublicClient, WalletClient, Address } from 'viem';
import { ADRS, MINIMAL_STAKING_ABI } from './contracts';

export const getEarnedRewards = async (publicClient: PublicClient, address: Address) => {
  return await publicClient.readContract({
    address: ADRS.staking as Address,
    abi: MINIMAL_STAKING_ABI,
    functionName: 'earned',
    args: [address],
  });
};

export const getStakedBalance = async (publicClient: PublicClient, address: Address) => {
  return await publicClient.readContract({
    address: ADRS.staking as Address,
    abi: MINIMAL_STAKING_ABI,
    functionName: 'balanceOf',
    args: [address],
  });
};

export const getRewardRate = async (publicClient: PublicClient) => {
  return await publicClient.readContract({
    address: ADRS.staking as Address,
    abi: MINIMAL_STAKING_ABI,
    functionName: 'rewardRate',
  });
};

export const stakeTokens = async (
  walletClient: WalletClient,
  account: Address,
  amount: bigint
) => {
  return await walletClient.writeContract({
    address: ADRS.staking as Address,
    abi: MINIMAL_STAKING_ABI,
    functionName: 'stake',
    args: [amount],
    account,
  });
};

export const withdrawTokens = async (
  walletClient: WalletClient,
  account: Address,
  amount: bigint
) => {
  return await walletClient.writeContract({
    address: ADRS.staking as Address,
    abi: MINIMAL_STAKING_ABI,
    functionName: 'withdraw',
    args: [amount],
    account,
  });
};

export const claimRewards = async (
  walletClient: WalletClient,
  account: Address
) => {
  return await walletClient.writeContract({
    address: ADRS.staking as Address,
    abi: MINIMAL_STAKING_ABI,
    functionName: 'getReward',
    account,
  });
};
