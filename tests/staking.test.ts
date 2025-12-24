
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { stakeTokens, getEarnedRewards, getRewardRate, claimRewards, withdrawTokens, getStakedBalance } from '../lib/staking';
import { parseUnits, Address, PublicClient, WalletClient } from 'viem';
import { ADRS, MINIMAL_STAKING_ABI } from '../lib/contracts';

describe('Ritual Staking Core Service', () => {
  const mockAddress = '0x1234567890123456789012345678901234567890' as Address;
  
  let mockPublicClient: Partial<PublicClient>;
  let mockWalletClient: Partial<WalletClient>;

  beforeEach(() => {
    mockPublicClient = {
      readContract: vi.fn() as Mock,
    };
    mockWalletClient = {
      writeContract: vi.fn() as Mock,
    };
    vi.clearAllMocks();
  });

  describe('Core Telemetry (Reads)', () => {
    it('getEarnedRewards: should fetch pending MCB blessing', async () => {
      const expected = parseUnits('25.5', 18);
      (mockPublicClient.readContract as Mock).mockResolvedValue(expected);
      const earned = await getEarnedRewards(mockPublicClient as PublicClient, mockAddress);
      
      expect(mockPublicClient.readContract).toHaveBeenCalledWith({
        address: ADRS.staking,
        abi: MINIMAL_STAKING_ABI,
        functionName: 'earned',
        args: [mockAddress],
      });
      expect(earned).toBe(expected);
    });

    it('getStakedBalance: should fetch current sacrifice level', async () => {
      const expected = parseUnits('1000', 18);
      (mockPublicClient.readContract as Mock).mockResolvedValue(expected);
      const balance = await getStakedBalance(mockPublicClient as PublicClient, mockAddress);
      
      expect(mockPublicClient.readContract).toHaveBeenCalledWith({
        address: ADRS.staking,
        abi: MINIMAL_STAKING_ABI,
        functionName: 'balanceOf',
        args: [mockAddress],
      });
      expect(balance).toBe(expected);
    });

    it('getRewardRate: should fetch global nexus emission intensity', async () => {
      const expected = parseUnits('0.15', 18);
      (mockPublicClient.readContract as Mock).mockResolvedValue(expected);
      const rate = await getRewardRate(mockPublicClient as PublicClient);
      
      expect(mockPublicClient.readContract).toHaveBeenCalledWith({
        address: ADRS.staking,
        abi: MINIMAL_STAKING_ABI,
        functionName: 'rewardRate',
      });
      expect(rate).toBe(expected);
    });
  });

  describe('Sacred Rituals (Writes)', () => {
    it('stakeTokens: should initiate sacrifice ritual', async () => {
      const amount = parseUnits('100', 18);
      (mockWalletClient.writeContract as Mock).mockResolvedValue('0xstake_hash');
      const hash = await stakeTokens(mockWalletClient as WalletClient, mockAddress, amount);
      
      expect(mockWalletClient.writeContract).toHaveBeenCalledWith({
        address: ADRS.staking,
        abi: MINIMAL_STAKING_ABI,
        functionName: 'stake',
        args: [amount],
        account: mockAddress,
      });
      expect(hash).toBe('0xstake_hash');
    });

    it('withdrawTokens: should execute recovery ritual', async () => {
      const amount = parseUnits('50', 18);
      (mockWalletClient.writeContract as Mock).mockResolvedValue('0xwithdraw_hash');
      const hash = await withdrawTokens(mockWalletClient as WalletClient, mockAddress, amount);
      
      expect(mockWalletClient.writeContract).toHaveBeenCalledWith({
        address: ADRS.staking,
        abi: MINIMAL_STAKING_ABI,
        functionName: 'withdraw',
        args: [amount],
        account: mockAddress,
      });
      expect(hash).toBe('0xwithdraw_hash');
    });

    it('claimRewards: should execute reward manifestation ritual', async () => {
      (mockWalletClient.writeContract as Mock).mockResolvedValue('0xclaim_hash');
      const hash = await claimRewards(mockWalletClient as WalletClient, mockAddress);
      
      expect(mockWalletClient.writeContract).toHaveBeenCalledWith({
        address: ADRS.staking,
        abi: MINIMAL_STAKING_ABI,
        functionName: 'getReward',
        account: mockAddress,
      });
      expect(hash).toBe('0xclaim_hash');
    });
  });
});
