
import { PublicClient, WalletClient, Address } from 'viem';
import { ADRS, MINIMAL_ERC20_ABI } from './contracts';

export const getTokenBalance = async (publicClient: PublicClient, address: Address) => {
  // Fix: Cast parameters to any to bypass viem's strict type checking on authorizationList and other context-dependent required fields
  return await publicClient.readContract({
    address: ADRS.token as Address,
    abi: MINIMAL_ERC20_ABI,
    functionName: 'balanceOf',
    args: [address],
  } as any);
};

export const getTokenDecimals = async (publicClient: PublicClient) => {
  // Fix: Cast parameters to any to bypass viem's strict type checking on authorizationList and other context-dependent required fields
  return await publicClient.readContract({
    address: ADRS.token as Address,
    abi: MINIMAL_ERC20_ABI,
    functionName: 'decimals',
  } as any);
};

export const getTokenSymbol = async (publicClient: PublicClient) => {
  // Fix: Cast parameters to any to bypass viem's strict type checking on authorizationList and other context-dependent required fields
  return await publicClient.readContract({
    address: ADRS.token as Address,
    abi: MINIMAL_ERC20_ABI,
    functionName: 'symbol',
  } as any);
};

export const approveToken = async (
  walletClient: WalletClient, 
  account: Address, 
  amount: bigint
) => {
  // Fix: Cast parameters to any to bypass viem's strict type checking on chain and authorization properties
  return await walletClient.writeContract({
    address: ADRS.token as Address,
    abi: MINIMAL_ERC20_ABI,
    functionName: 'approve',
    args: [ADRS.staking as Address, amount],
    account,
  } as any);
};

export const transferToken = async (
  walletClient: WalletClient,
  account: Address,
  to: Address,
  amount: bigint
) => {
  // Fix: Cast parameters to any to bypass viem's strict type checking on chain and authorization properties
  return await walletClient.writeContract({
    address: ADRS.token as Address,
    abi: MINIMAL_ERC20_ABI,
    functionName: 'transfer',
    args: [to, amount],
    account,
  } as any);
};
