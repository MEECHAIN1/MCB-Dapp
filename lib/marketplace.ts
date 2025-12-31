
import { PublicClient, WalletClient, Address } from 'viem';
import { ADRS, MINIMAL_SWAP_ABI } from './contracts';

export const getListing = async (publicClient: PublicClient, tokenId: bigint) => {
  return await publicClient.readContract({
    address: ADRS.swap as Address,
    abi: MINIMAL_SWAP_ABI,
    functionName: 'listings',
    args: [tokenId],
  });
};

export const listBot = async (
  walletClient: WalletClient,
  account: Address,
  tokenId: bigint,
  price: bigint
) => {
  return await walletClient.writeContract({
    address: ADRS.swap as Address,
    abi: MINIMAL_SWAP_ABI,
    functionName: 'listNFT',
    args: [tokenId, price],
    account,
  });
};

export const buyBot = async (
  walletClient: WalletClient,
  account: Address,
  tokenId: bigint,
  price: bigint
) => {
  return await walletClient.writeContract({
    address: ADRS.swap as Address,
    abi: MINIMAL_SWAP_ABI,
    functionName: 'buyNFT',
    args: [tokenId],
    account,
    value: price,
  });
};

export const cancelListing = async (
  walletClient: WalletClient,
  account: Address,
  tokenId: bigint
) => {
  return await walletClient.writeContract({
    address: ADRS.swap as Address,
    abi: MINIMAL_SWAP_ABI,
    functionName: 'cancelListing',
    args: [tokenId],
    account,
  });
};