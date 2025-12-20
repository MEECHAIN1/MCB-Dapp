
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { describe, it, expect, vi } from 'vitest';
import { getTokenBalance, getTokenDecimals, getTokenSymbol, approveToken, transferToken } from '../lib/token';
import { parseUnits } from 'viem';
import { ADRS } from '../lib/contracts';

describe('Token Service', () => {
  const mockAddress = '0x1234567890123456789012345678901234567890';
  const mockRecipient = '0x0987654321098765432109876543210987654321';

  describe('Reads', () => {
    it('getTokenBalance: fetches balance correctly', async () => {
      const mockPublicClient = {
        readContract: vi.fn().mockResolvedValue(parseUnits('100', 18)),
      };
      const balance = await getTokenBalance(mockPublicClient as any, mockAddress);
      expect(mockPublicClient.readContract).toHaveBeenCalledWith(expect.objectContaining({
        address: ADRS.token,
        functionName: 'balanceOf',
        args: [mockAddress]
      }));
      expect(balance).toBe(parseUnits('100', 18));
    });

    it('getTokenDecimals: fetches decimals correctly', async () => {
      const mockPublicClient = {
        readContract: vi.fn().mockResolvedValue(18),
      };
      const decimals = await getTokenDecimals(mockPublicClient as any);
      expect(mockPublicClient.readContract).toHaveBeenCalledWith(expect.objectContaining({
        address: ADRS.token,
        functionName: 'decimals'
      }));
      expect(decimals).toBe(18);
    });

    it('getTokenSymbol: fetches symbol correctly', async () => {
      const mockPublicClient = {
        readContract: vi.fn().mockResolvedValue('MEE'),
      };
      const symbol = await getTokenSymbol(mockPublicClient as any);
      expect(mockPublicClient.readContract).toHaveBeenCalledWith(expect.objectContaining({
        address: ADRS.token,
        functionName: 'symbol'
      }));
      expect(symbol).toBe('MEE');
    });
  });

  describe('Writes', () => {
    it('approveToken: initiates approval for the staking contract correctly', async () => {
      const mockWalletClient = {
        writeContract: vi.fn().mockResolvedValue('0xapprovehash'),
      };
      const amount = parseUnits('50', 18);
      const hash = await approveToken(mockWalletClient as any, mockAddress, amount);
      expect(mockWalletClient.writeContract).toHaveBeenCalledWith(expect.objectContaining({
        address: ADRS.token,
        functionName: 'approve',
        args: [ADRS.staking, amount],
        account: mockAddress
      }));
      expect(hash).toBe('0xapprovehash');
    });

    it('transferToken: initiates token transfer correctly', async () => {
      const mockWalletClient = {
        writeContract: vi.fn().mockResolvedValue('0xtransferhash'),
      };
      const amount = parseUnits('10', 18);
      const hash = await transferToken(mockWalletClient as any, mockAddress, mockRecipient, amount);
      expect(mockWalletClient.writeContract).toHaveBeenCalledWith(expect.objectContaining({
        address: ADRS.token,
        functionName: 'transfer',
        args: [mockRecipient, amount],
        account: mockAddress
      }));
      expect(hash).toBe('0xtransferhash');
    });
  });
});
