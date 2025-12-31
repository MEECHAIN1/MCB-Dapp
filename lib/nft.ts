
import { PublicClient, WalletClient, Address } from 'viem';
import { ADRS, MINIMAL_NFT_ABI } from './lib/contracts';

export const getNFTBalance = async (publicClient: PublicClient, address: Address) => {
  return await publicClient.readContract({
    address: ADRS.nft as Address,
    abi: MINIMAL_NFT_ABI,
    functionName: 'balanceOf',
    args: [address],
  });
};

export const mintBot = async (
  walletClient: WalletClient,
  account: Address,
  uri: string = "ipfs://mcb-bot-ritual-metadata"
) => {
  return await walletClient.writeContract({
    address: ADRS.nft as Address,
    abi: MINIMAL_NFT_ABI,
    functionName: 'safeMint',
    args: [account, uri],
    account,
  });
};

export const getNFTUri = async (publicClient: PublicClient, tokenId: bigint) => {
  return await publicClient.readContract({
    address: ADRS.nft as Address,
    abi: MINIMAL_NFT_ABI,
    functionName: 'tokenURI',
    args: [tokenId],
  });
};

export const getNFTOwner = async (publicClient: PublicClient, tokenId: bigint) => {
  return await publicClient.readContract({
    address: ADRS.nft as Address,
    abi: MINIMAL_NFT_ABI,
    functionName: 'ownerOf',
    args: [tokenId],
  });
};

export const setNFTApprovalForAll = async (
  walletClient: WalletClient,
  account: Address,
  operator: Address,
  approved: boolean
) => {
  return await walletClient.writeContract({
    address: ADRS.nft as Address,
    abi: MINIMAL_NFT_ABI,
    functionName: 'setApprovalForAll',
    args: [operator, approved],
    account,
  });
};
