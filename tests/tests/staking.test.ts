import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getEarned, getRewardRate, stakeNft } from '@/services/staking';
import { client } from '@/lib/viemClient';

// 🪄 ทำการ Mock Module ภายนอกเพื่อไม่ให้เกิดการเรียกใช้ Network จริง
vi.mock('@/lib/viemClient', () => ({
  client: {
    readContract: vi.fn(),
  },
}));

vi.mock('@wagmi/core', () => ({
  getAccount: vi.fn(() => ({ address: '0x123...abc' })),
}));

describe('🛡️ Staking Ritual Logic', () => {
  
  beforeEach(() => {
    vi.clearAllMocks(); // ล้างคำสาป (Reset Mocks) ก่อนการทดสอบแต่ละรอบ
  });

  it('ควรดึงค่า Reward Rate จากสัญญาได้ถูกต้อง', async () => {
    const mockRate = BigInt(10000000000000000); // 0.01 MCB per block
    (client.readContract as any).mockResolvedValue(mockRate);

    const rate = await getRewardRate();
    
    expect(rate).toBe(mockRate);
    expect(client.readContract).toHaveBeenCalledWith(expect.objectContaining({
      functionName: 'rewardRate',
    }));
  });

  it('ควรคำนวณรางวัลสะสม (Earned) สำหรับผู้ใช้ได้แม่นยำ', async () => {
    const mockEarned = BigInt(123450000000000000000); // 123.45 MCB
    (client.readContract as any).mockResolvedValue(mockEarned);

    const earned = await getEarned('0x123...abc');

    expect(earned).toBe(mockEarned);
  });

  it('ควรเกิดข้อผิดพลาด (Throw Error) หากไม่มี Wallet Client ในการทำพิธี Stake', async () => {
    // ทดสอบกรณีส่งค่า null เป็น walletClient
    await expect(stakeNft(null, 1n, '0x123')).rejects.toThrow("Wallet client not provided");
  });

});