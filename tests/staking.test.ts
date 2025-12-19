
import { describe, it, expect, vi } from 'vitest';
import { stakeTokens, getEarnedRewards } from '../lib/staking';
import { parseUnits } from 'viem';

describe('Staking Service', () => {
  const mockAddress = '0x1234567890123456789012345678901234567890';

  it('calculates earned rewards via RPC mock', async () => {
    const mockPublicClient = {
      readContract: vi.fn().mockResolvedValue(parseUnits('5.5', 18)),
    };

    const earned = await getEarnedRewards(mockPublicClient as any, mockAddress);
    expect(earned).toBe(parseUnits('5.5', 18));
  });

  it('submits stake transaction correctly', async () => {
    const mockWalletClient = {
      writeContract: vi.fn().mockResolvedValue('0xtxhash'),
    };
    const amount = parseUnits('1000', 18);

    const hash = await stakeTokens(mockWalletClient as any, mockAddress, amount);
    
    expect(mockWalletClient.writeContract).toHaveBeenCalledWith(expect.objectContaining({
      functionName: 'stake',
      args: [amount]
    }));
    expect(hash).toBe('0xtxhash');
  });
});
