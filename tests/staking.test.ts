
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { stakeTokens, getEarnedRewards, getRewardRate, claimRewards, withdrawTokens, getStakedBalance } from '../lib/staking';
import { parseUnits } from 'viem';
import { ADRS } from '../lib/contracts';

describe('Ritual Staking Service', () => {
  const mockAddress = '0x1234567890123456789012345678901234567890' as const;
  
  let mockPublicClient: any;
  let mockWalletClient: any;

  beforeEach(() => {
    mockPublicClient = { readContract: vi.fn() };
    mockWalletClient = { writeContract: vi.fn() };
  });

  describe('Telemetry (Reads)', () => {
    it('getEarnedRewards: should fetch pending MCB rewards', async () => {
      const expected = parseUnits('10.5', 18);
      mockPublicClient.readContract.mockResolvedValue(expected);

      const earned = await getEarnedRewards(mockPublicClient, mockAddress);
      
      expect(mockPublicClient.readContract).toHaveBeenCalledWith(expect.objectContaining({
        address: ADRS.staking,
        functionName: 'earned',
        args: [mockAddress]
      }));
      expect(earned).toBe(expected);
    });

    it('getStakedBalance: should fetch amount currently sacrificed to nexus', async () => {
      const expected = parseUnits('5000', 18);
      mockPublicClient.readContract.mockResolvedValue(expected);

      const balance = await getStakedBalance(mockPublicClient, mockAddress);
      
      expect(mockPublicClient.readContract).toHaveBeenCalledWith(expect.objectContaining({
        address: ADRS.staking,
        functionName: 'balanceOf',
        args: [mockAddress]
      }));
      expect(balance).toBe(expected);
    });

    it('getRewardRate: should fetch global emission intensity', async () => {
      const expected = parseUnits('0.5', 18);
      mockPublicClient.readContract.mockResolvedValue(expected);

      const rate = await getRewardRate(mockPublicClient);
      expect(rate).toBe(expected);
    });
  });

  describe('Rituals (Writes)', () => {
    it('stakeTokens: should initiate stake ritual', async () => {
      const amount = parseUnits('100', 18);
      mockWalletClient.writeContract.mockResolvedValue('0xstake_hash');

      const hash = await stakeTokens(mockWalletClient, mockAddress, amount);
      
      expect(mockWalletClient.writeContract).toHaveBeenCalledWith(expect.objectContaining({
        address: ADRS.staking,
        functionName: 'stake',
        args: [amount],
        account: mockAddress
      }));
      expect(hash).toBe('0xstake_hash');
    });

    it('withdrawTokens: should initiate withdrawal ritual', async () => {
      const amount = parseUnits('50', 18);
      mockWalletClient.writeContract.mockResolvedValue('0xwithdraw_hash');

      const hash = await withdrawTokens(mockWalletClient, mockAddress, amount);
      
      expect(mockWalletClient.writeContract).toHaveBeenCalledWith(expect.objectContaining({
        address: ADRS.staking,
        functionName: 'withdraw',
        args: [amount],
        account: mockAddress
      }));
      expect(hash).toBe('0xwithdraw_hash');
    });

    it('claimRewards: should execute the reward collection ritual', async () => {
      mockWalletClient.writeContract.mockResolvedValue('0xclaim_hash');

      const hash = await claimRewards(mockWalletClient, mockAddress);
      
      expect(mockWalletClient.writeContract).toHaveBeenCalledWith(expect.objectContaining({
        address: ADRS.staking,
        functionName: 'getReward',
        account: mockAddress
      }));
      expect(hash).toBe('0xclaim_hash');
    });
  });
});
