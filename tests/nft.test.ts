
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { describe, it, expect, vi } from 'vitest';
import { getNFTBalance, getNFTUri, getNFTOwner, setNFTApprovalForAll } from '../lib/nft';
import { ADRS } from '../lib/contracts';

describe('NFT Service', () => {
  const mockAddress = '0x1234567890123456789012345678901234567890';
  const mockOperator = '0x0987654321098765432109876543210987654321';

  describe('Reads', () => {
    it('getNFTBalance: returns collection count correctly', async () => {
      const mockPublicClient = {
        readContract: vi.fn().mockResolvedValue(5n),
      };
      const balance = await getNFTBalance(mockPublicClient as any, mockAddress);
      expect(mockPublicClient.readContract).toHaveBeenCalledWith(expect.objectContaining({
        address: ADRS.nft,
        functionName: 'balanceOf',
        args: [mockAddress]
      }));
      expect(balance).toBe(5n);
    });

    it('getNFTUri: fetches token URI for specific bot IDs', async () => {
      const mockPublicClient = {
        readContract: vi.fn().mockResolvedValue('ipfs://meebot-1'),
      };
      const uri = await getNFTUri(mockPublicClient as any, 1n);
      expect(mockPublicClient.readContract).toHaveBeenCalledWith(expect.objectContaining({
        address: ADRS.nft,
        functionName: 'tokenURI',
        args: [1n]
      }));
      expect(uri).toBe('ipfs://meebot-1');
    });

    it('getNFTOwner: fetches the owner of a specific token', async () => {
      const mockPublicClient = {
        readContract: vi.fn().mockResolvedValue(mockAddress),
      };
      const owner = await getNFTOwner(mockPublicClient as any, 42n);
      expect(mockPublicClient.readContract).toHaveBeenCalledWith(expect.objectContaining({
        address: ADRS.nft,
        functionName: 'ownerOf',
        args: [42n]
      }));
      expect(owner).toBe(mockAddress);
    });
  });

  describe('Writes', () => {
    it('setNFTApprovalForAll: toggles operator approval status', async () => {
      const mockWalletClient = {
        writeContract: vi.fn().mockResolvedValue('0xapprovalhash'),
      };
      const hash = await setNFTApprovalForAll(mockWalletClient as any, mockAddress, mockOperator, true);
      expect(mockWalletClient.writeContract).toHaveBeenCalledWith(expect.objectContaining({
        address: ADRS.nft,
        functionName: 'setApprovalForAll',
        args: [mockOperator, true],
        account: mockAddress
      }));
      expect(hash).toBe('0xapprovalhash');
    });
  });
});
