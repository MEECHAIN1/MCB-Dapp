
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { describe, it, expect, vi } from 'vitest';
import { stakeTokens, getEarnedRewards, getRewardRate, claimRewards, withdrawTokens } from '../lib/staking';
import { parseUnits } from 'viem';
import { ADRS } from '../lib/contracts';

describe('Staking Service', () => {
  const mockAddress = '0x1234567890123456789012345678901234567890';

  describe('Reads', () => {
    it('getEarnedRewards: calculates earned rewards correctly', async () => {
      const mockPublicClient = {
        readContract: vi.fn().mockResolvedValue(parseUnits('5.5', 18)),
      };
      const earned = await getEarnedRewards(mockPublicClient as any, mockAddress);
      expect(mockPublicClient.readContract).toHaveBeenCalledWith(expect.objectContaining({
        address: ADRS.staking,
        functionName: 'earned',
        args: [mockAddress]
      }));
      expect(earned).toBe(parseUnits('5.5', 18));
    });

    it('getRewardRate: fetches the current reward intensity', async () => {
      const mockPublicClient = {
        readContract: vi.fn().mockResolvedValue(parseUnits('0.1', 18)),
      };
      const rate = await getRewardRate(mockPublicClient as any);
      expect(mockPublicClient.readContract).toHaveBeenCalledWith(expect.objectContaining({
        address: ADRS.staking,
        functionName: 'rewardRate'
      }));
      expect(rate).toBe(parseUnits('0.1', 18));
    });
  });

  describe('Writes', () => {
    it('stakeTokens: submits stake transaction with correct parameters', async () => {
      const mockWalletClient = {
        writeContract: vi.fn().mockResolvedValue('0xtxhash'),
      };
      const amount = parseUnits('1000', 18);
      const hash = await stakeTokens(mockWalletClient as any, mockAddress, amount);
      expect(mockWalletClient.writeContract).toHaveBeenCalledWith(expect.objectContaining({
        address: ADRS.staking,
        functionName: 'stake',
        args: [amount],
        account: mockAddress
      }));
      expect(hash).toBe('0xtxhash');
    });

    it('withdrawTokens: initiates token withdrawal correctly', async () => {
      const mockWalletClient = {
        writeContract: vi.fn().mockResolvedValue('0xwithdrawhash'),
      };
      const amount = parseUnits('500', 18);
      const hash = await withdrawTokens(mockWalletClient as any, mockAddress, amount);
      expect(mockWalletClient.writeContract).toHaveBeenCalledWith(expect.objectContaining({
        address: ADRS.staking,
        functionName: 'withdraw',
        args: [amount],
        account: mockAddress
      }));
      expect(hash).toBe('0xwithdrawhash');
    });

    it('claimRewards: initiates the claim rewards ritual', async () => {
      const mockWalletClient = {
        writeContract: vi.fn().mockResolvedValue('0xclaimhash'),
      };
      const hash = await claimRewards(mockWalletClient as any, mockAddress);
      expect(mockWalletClient.writeContract).toHaveBeenCalledWith(expect.objectContaining({
        address: ADRS.staking,
        functionName: 'getReward',
        account: mockAddress
      }));
      expect(hash).toBe('0xclaimhash');
    });
  });
});
