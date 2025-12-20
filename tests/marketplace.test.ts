
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listBot, buyBot, getListing, cancelListing } from '../lib/marketplace';
import { parseUnits } from 'viem';
import { ADRS } from '../lib/contracts';

describe('Cyber-Nexus Marketplace Service', () => {
  const mockAddress = '0x1234567890123456789012345678901234567890' as const;
  const mockTokenId = 7n;
  
  let mockPublicClient: any;
  let mockWalletClient: any;

  beforeEach(() => {
    mockPublicClient = { readContract: vi.fn() };
    mockWalletClient = { writeContract: vi.fn() };
  });

  describe('Discovery (Reads)', () => {
    it('getListing: should return active trade data for a unit', async () => {
      const mockResult = [mockAddress, parseUnits('500', 18), true] as const;
      mockPublicClient.readContract.mockResolvedValue(mockResult);

      const listing = await getListing(mockPublicClient, mockTokenId);
      
      expect(mockPublicClient.readContract).toHaveBeenCalledWith(expect.objectContaining({
        address: ADRS.marketplace,
        functionName: 'listings',
        args: [mockTokenId]
      }));
      expect(listing).toEqual(mockResult);
    });
  });

  describe('Trading (Writes)', () => {
    it('listBot: should post a unit for trade in the nexus', async () => {
      const price = parseUnits('1000', 18);
      mockWalletClient.writeContract.mockResolvedValue('0xlist_hash');

      const hash = await listBot(mockWalletClient, mockAddress, mockTokenId, price);
      
      expect(mockWalletClient.writeContract).toHaveBeenCalledWith(expect.objectContaining({
        address: ADRS.marketplace,
        functionName: 'listNFT',
        args: [mockTokenId, price],
        account: mockAddress
      }));
      expect(hash).toBe('0xlist_hash');
    });

    it('buyBot: should execute purchase of a unit from the nexus', async () => {
      const price = parseUnits('500', 18);
      mockWalletClient.writeContract.mockResolvedValue('0xbuy_hash');

      const hash = await buyBot(mockWalletClient, mockAddress, mockTokenId, price);
      
      expect(mockWalletClient.writeContract).toHaveBeenCalledWith(expect.objectContaining({
        address: ADRS.marketplace,
        functionName: 'buyNFT',
        args: [mockTokenId],
        account: mockAddress,
        value: price
      }));
      expect(hash).toBe('0xbuy_hash');
    });

    it('cancelListing: should remove a unit from active trade', async () => {
      mockWalletClient.writeContract.mockResolvedValue('0xcancel_hash');

      const hash = await cancelListing(mockWalletClient, mockAddress, mockTokenId);
      
      expect(mockWalletClient.writeContract).toHaveBeenCalledWith(expect.objectContaining({
        address: ADRS.marketplace,
        functionName: 'cancelListing',
        args: [mockTokenId],
        account: mockAddress
      }));
      expect(hash).toBe('0xcancel_hash');
    });
  });
});
