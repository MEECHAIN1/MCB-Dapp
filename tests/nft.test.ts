
import { describe, it, expect, vi } from 'vitest';
import { getNFTBalance } from '../lib/nft';

describe('NFT Service', () => {
  const mockAddress = '0x1234567890123456789012345678901234567890';

  it('returns collection count', async () => {
    const mockPublicClient = {
      readContract: vi.fn().mockResolvedValue(5n),
    };

    const balance = await getNFTBalance(mockPublicClient as any, mockAddress);
    expect(balance).toBe(5n);
    expect(mockPublicClient.readContract).toHaveBeenCalled();
  });
});
