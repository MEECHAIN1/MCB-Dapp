import { ethers } from 'ethers';
import { ADRS, MINIMAL_NFT_ABI } from '../contracts';

/**
 * ฟังก์ชันดึงข้อมูล MeeBots ที่ผู้ใช้ครอบครอง
 */
export const getOwnedMeeBots = async (address: string) => {
  if (!window.ethereum) throw new Error("No crypto wallet found");
  
  const provider = new ethers.BrowserProvider(window.ethereum);
  const nftContract = new ethers.Contract(ADRS.nft, MINIMAL_NFT_ABI, provider);

  try {
    // ดึงจำนวน NFT ที่ถือครอง
    const balance = await nftContract.balanceOf(address);
    const nfts = [];

    // วนลูปเพื่อดึง TokenID และ Metadata (ตัวอย่างเบื้องต้น)
    for (let i = 0; i < Number(balance); i++) {
      // หมายเหตุ: ในระบบจริงควรใช้ Index หรือ Events เพื่อความเร็ว
      // นี่คือ Logic พื้นฐานสำหรับการดึงข้อมูล
      nfts.push({
        tokenId: i.toString(),
        metadata: {
          name: `MeeBot #${i}`,
          description: "MeeChain Ritual Guardian"
        }
      });
    }

    return nfts;
  } catch (error) {
    console.error("Failed to fetch MeeBots:", error);
    return [];
  }
};