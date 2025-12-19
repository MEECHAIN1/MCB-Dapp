
import { PublicClient, WalletClient, Address } from 'viem';
import { ADRS, MINIMAL_ERC20_ABI } from './contracts';

export const getTokenBalance = async (publicClient: PublicClient, address: Address) => {
  return await publicClient.readContract({
    address: ADRS.token as Address,
    abi: MINIMAL_ERC20_ABI,
    functionName: 'balanceOf',
    args: [address],
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
