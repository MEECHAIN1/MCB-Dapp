
import { PublicClient, WalletClient, Address } from 'viem';
import { ADRS, MINIMAL_NFT_ABI } from './contracts';

export const getNFTBalance = async (publicClient: PublicClient, address: Address) => {
  // Fix: Cast parameters to any to bypass viem's strict type checking on authorizationList and other context-dependent required fields
  return await publicClient.readContract({
    address: ADRS.nft as Address,
    abi: MINIMAL_NFT_ABI,
    functionName: 'balanceOf',
    args: [address],
  } as any);
};

export const mintBot = async (
  walletClient: WalletClient,
  account: Address,
  uri: string = "ipfs://mcb-bot-ritual-metadata"
) => {
  // Fix: Cast parameters to any to bypass viem's strict type checking on chain and authorization properties
  return await walletClient.writeContract({
    address: ADRS.nft as Address,
    abi: MINIMAL_NFT_ABI,
    functionName: 'safeMint',
    args: [account, uri],
    account,
  } as any);
};

export const getNFTUri = async (publicClient: PublicClient, tokenId: bigint) => {
  // Fix: Cast parameters to any to bypass viem's strict type checking on authorizationList and other context-dependent required fields
  return await publicClient.readContract({
    address: ADRS.nft as Address,
    abi: MINIMAL_NFT_ABI,
    functionName: 'tokenURI',
    args: [tokenId],
  } as any);
};

export const getNFTOwner = async (publicClient: PublicClient, tokenId: bigint) => {
  // Fix: Cast parameters to any to bypass viem's strict type checking on authorizationList and other context-dependent required fields
  return await publicClient.readContract({
    address: ADRS.nft as Address,
    abi: MINIMAL_NFT_ABI,
    functionName: 'ownerOf',
    args: [tokenId],
  } as any);
};

export const setNFTApprovalForAll = async (
  walletClient: WalletClient,
  account: Address,
  operator: Address,
  approved: boolean
) => {
  // Fix: Cast parameters to any to bypass viem's strict type checking on chain and authorization properties
  return await walletClient.writeContract({
    address: ADRS.nft as Address,
    abi: MINIMAL_NFT_ABI,
    functionName: 'setApprovalForAll',
    args: [operator, approved],
    account,
  } as any);
};
