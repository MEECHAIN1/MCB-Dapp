
import { PublicClient, WalletClient, Address } from 'viem';
import { ADRS, MINIMAL_STAKING_ABI } from './contracts';

export const getEarnedRewards = async (publicClient: PublicClient, address: Address) => {
  // Fix: Cast parameters to any to bypass viem's strict type checking on authorizationList and other context-dependent required fields
  return await publicClient.readContract({
    address: ADRS.staking as Address,
    abi: MINIMAL_STAKING_ABI,
    functionName: 'earned',
    args: [address],
  } as any);
};

export const getStakedBalance = async (publicClient: PublicClient, address: Address) => {
  // Fix: Cast parameters to any to bypass viem's strict type checking on authorizationList and other context-dependent required fields
  return await publicClient.readContract({
    address: ADRS.staking as Address,
    abi: MINIMAL_STAKING_ABI,
    functionName: 'balanceOf',
    args: [address],
  } as any);
};

export const getRewardRate = async (publicClient: PublicClient) => {
  // Fix: Cast parameters to any to bypass viem's strict type checking on authorizationList and other context-dependent required fields
  return await publicClient.readContract({
    address: ADRS.staking as Address,
    abi: MINIMAL_STAKING_ABI,
    functionName: 'rewardRate',
  } as any);
};

export const stakeTokens = async (
  walletClient: WalletClient,
  account: Address,
  amount: bigint
) => {
  // Fix: Cast parameters to any to bypass viem's strict type checking on chain and authorization properties
  return await walletClient.writeContract({
    address: ADRS.staking as Address,
    abi: MINIMAL_STAKING_ABI,
    functionName: 'stake',
    args: [amount],
    account,
  } as any);
};

export const withdrawTokens = async (
  walletClient: WalletClient,
  account: Address,
  amount: bigint
) => {
  // Fix: Cast parameters to any to bypass viem's strict type checking on chain and authorization properties
  return await walletClient.writeContract({
    address: ADRS.staking as Address,
    abi: MINIMAL_STAKING_ABI,
    functionName: 'withdraw',
    args: [amount],
    account,
  } as any);
};

export const claimRewards = async (
  walletClient: WalletClient,
  account: Address
) => {
  // Fix: Cast parameters to any to bypass viem's strict type checking on chain and authorization properties
  return await walletClient.writeContract({
    address: ADRS.staking as Address,
    abi: MINIMAL_STAKING_ABI,
    functionName: 'getReward',
    account,
  } as any);
};
