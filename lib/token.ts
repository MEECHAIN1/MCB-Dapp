
import { PublicClient, WalletClient, Address, gas } from 'viem';
import { ADRS, MINIMAL_ERC20_ABI } from './lib/contracts';

export const getTokenBalance = async (publicClient: PublicClient, address: Address) => {
  return await publicClient.readContract({
    address: ADRS.token as Address,
    abi: MINIMAL_ERC20_ABI,
    functionName: 'balanceOf',
    args: [address],
  });
};

export const getTokenDecimals = async (publicClient: PublicClient) => {
  return await publicClient.readContract({
    address: ADRS.token as Address,
    abi: MINIMAL_ERC20_ABI,
    functionName: 'decimals',
  });
};

export const getTokenSymbol = async (publicClient: PublicClient) => {
  return await publicClient.readContract({
    address: ADRS.token as Address,
    abi: MINIMAL_ERC20_ABI,
    functionName: 'symbol',
  });
};

export const approveToken = async (
  walletClient: WalletClient, 
  account: Address, 
  amount: bigint
) => {
  return await walletClient.writeContract({
    address: ADRS.token as Address,
    abi: MINIMAL_ERC20_ABI,
    functionName: 'approve',
    args: [ADRS.staking as Address, amount],
    account,
  });
};

export const transferToken = async (
  walletClient: WalletClient,
  account: Address,
  to: Address,
  amount: bigint
) => {
  return await walletClient.writeContract({
    address: ADRS.token as Address,
    abi: MINIMAL_ERC20_ABI,
    functionName: 'transfer',
    args: [to, amount],
    account,
  });
};
