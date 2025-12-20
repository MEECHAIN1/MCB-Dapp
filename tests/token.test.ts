
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getTokenBalance, getTokenDecimals, getTokenSymbol, approveToken, transferToken } from '../lib/token';
import { parseUnits } from 'viem';
import { ADRS } from '../lib/contracts';

describe('MCB Token Service', () => {
  const mockAddress = '0x1234567890123456789012345678901234567890' as const;
  const mockRecipient = '0x0987654321098765432109876543210987654321' as const;
  
  let mockPublicClient: any;
  let mockWalletClient: any;

  beforeEach(() => {
    mockPublicClient = {
      readContract: vi.fn(),
    };
    mockWalletClient = {
      writeContract: vi.fn(),
    };
  });

  describe('Read Operations', () => {
    it('getTokenBalance: should return correctly formatted balance', async () => {
      const expectedBalance = parseUnits('500', 18);
      mockPublicClient.readContract.mockResolvedValue(expectedBalance);

      const balance = await getTokenBalance(mockPublicClient, mockAddress);
      
      expect(mockPublicClient.readContract).toHaveBeenCalledWith(expect.objectContaining({
        address: ADRS.token,
        functionName: 'balanceOf',
        args: [mockAddress]
      }));
      expect(balance).toBe(expectedBalance);
    });

    it('getTokenDecimals: should return contract decimals (18)', async () => {
      mockPublicClient.readContract.mockResolvedValue(18);
      const decimals = await getTokenDecimals(mockPublicClient);
      expect(decimals).toBe(18);
    });

    it('getTokenSymbol: should return MCB symbol', async () => {
      mockPublicClient.readContract.mockResolvedValue('MCB');
      const symbol = await getTokenSymbol(mockPublicClient);
      expect(symbol).toBe('MCB');
    });

    it('should handle read errors gracefully', async () => {
      mockPublicClient.readContract.mockRejectedValue(new Error('RPC Error'));
      await expect(getTokenBalance(mockPublicClient, mockAddress)).rejects.toThrow('RPC Error');
    });
  });

  describe('Write Operations', () => {
    it('approveToken: should initiate approval ritual for the staking contract', async () => {
      const amount = parseUnits('1000', 18);
      const mockHash = '0xapprove_hash';
      mockWalletClient.writeContract.mockResolvedValue(mockHash);

      const hash = await approveToken(mockWalletClient, mockAddress, amount);
      
      expect(mockWalletClient.writeContract).toHaveBeenCalledWith(expect.objectContaining({
        address: ADRS.token,
        functionName: 'approve',
        args: [ADRS.staking, amount],
        account: mockAddress
      }));
      expect(hash).toBe(mockHash);
    });

    it('transferToken: should execute token transfer to recipient', async () => {
      const amount = parseUnits('50', 18);
      const mockHash = '0xtransfer_hash';
      mockWalletClient.writeContract.mockResolvedValue(mockHash);

      const hash = await transferToken(mockWalletClient, mockAddress, mockRecipient, amount);
      
      expect(mockWalletClient.writeContract).toHaveBeenCalledWith(expect.objectContaining({
        address: ADRS.token,
        functionName: 'transfer',
        args: [mockRecipient, amount],
        account: mockAddress
      }));
      expect(hash).toBe(mockHash);
    });

    it('should handle write errors (e.g. user rejection)', async () => {
      mockWalletClient.writeContract.mockRejectedValue(new Error('User Rejected'));
      await expect(approveToken(mockWalletClient, mockAddress, 100n)).rejects.toThrow('User Rejected');
    });
  });
});
