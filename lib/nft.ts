
import { PublicClient, Address } from 'viem';
import { ADRS, MINIMAL_NFT_ABI } from './contracts';

export const getNFTBalance = async (publicClient: PublicClient, address: Address) => {
  return await publicClient.readContract({
    address: ADRS.nft as Address,
    abi: MINIMAL_NFT_ABI,
    functionName: 'balanceOf',
    args: [address],
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
