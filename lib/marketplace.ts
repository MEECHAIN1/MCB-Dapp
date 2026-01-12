
import { PublicClient, WalletClient, Address } from 'viem';
import { ADRS, MINIMAL_MARKETPLACE_ABI } from './contracts';

export const getListing = async (publicClient: PublicClient, tokenId: bigint) => {
  // Fix: Cast parameters to any to bypass viem's strict type checking on authorizationList and other context-dependent required fields
  return await publicClient.readContract({
    address: ADRS.marketplace as Address,
    abi: MINIMAL_MARKETPLACE_ABI,
    functionName: 'listings',
    args: [tokenId],
  } as any);
};

export const listBot = async (
  walletClient: WalletClient,
  account: Address,
  tokenId: bigint,
  price: bigint
) => {
  // Fix: Cast parameters to any to bypass viem's strict type checking on chain and authorization properties
  return await walletClient.writeContract({
    address: ADRS.marketplace as Address,
    abi: MINIMAL_MARKETPLACE_ABI,
    functionName: 'listNFT',
    args: [tokenId, price],
    account,
  } as any);
};

export const buyBot = async (
  walletClient: WalletClient,
  account: Address,
  tokenId: bigint,
  price: bigint
) => {
  // Fix: Cast parameters to any to bypass viem's strict type checking on chain and authorization properties
  return await walletClient.writeContract({
    address: ADRS.marketplace as Address,
    abi: MINIMAL_MARKETPLACE_ABI,
    functionName: 'buyNFT',
    args: [tokenId],
    account,
    value: price,
  } as any);
};

export const cancelListing = async (
  walletClient: WalletClient,
  account: Address,
  tokenId: bigint
) => {
  // Fix: Cast parameters to any to bypass viem's strict type checking on chain and authorization properties
  return await walletClient.writeContract({
    address: ADRS.marketplace as Address,
    abi: MINIMAL_MARKETPLACE_ABI,
    functionName: 'cancelListing',
    args: [tokenId],
    account,
  } as any);
};
