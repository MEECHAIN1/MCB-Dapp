import { ethers } from 'ethers';
import { ADRS, MINIMAL_NFT_ABI } from '../contracts';

export const getOwnedMeeBots = async (address: string) => {
  if (!(window as any).ethereum) return [];
  const provider = new ethers.BrowserProvider((window as any).ethereum);
  const nftContract = new ethers.Contract(ADRS.nft, MINIMAL_NFT_ABI, provider);
  try {
    const balance = await nftContract.balanceOf(address);
    const bots = [];
    for (let i = 0; i < Number(balance); i++) {
      bots.push({ tokenId: i.toString(), metadata: { name: `MeeBot #${i}` } });
    }
    return bots;
  } catch (e) {
    return [];
  }
};