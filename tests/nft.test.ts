
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getNFTBalance, getNFTUri, getNFTOwner, setNFTApprovalForAll, mintBot } from '../lib/nft';
import { ADRS } from '../lib/contracts';

describe('MCB-Bot Asset Service', () => {
  const mockAddress = '0x1234567890123456789012345678901234567890' as const;
  const mockOperator = '0x0987654321098765432109876543210987654321' as const;
  
  let mockPublicClient: any;
  let mockWalletClient: any;

  beforeEach(() => {
    mockPublicClient = { readContract: vi.fn() };
    mockWalletClient = { writeContract: vi.fn() };
  });

  describe('Asset Telemetry (Reads)', () => {
    it('getNFTBalance: should return unit count in fleet', async () => {
      mockPublicClient.readContract.mockResolvedValue(12n);
      const balance = await getNFTBalance(mockPublicClient, mockAddress);
      
      expect(mockPublicClient.readContract).toHaveBeenCalledWith(expect.objectContaining({
        address: ADRS.nft,
        functionName: 'balanceOf',
        args: [mockAddress]
      }));
      expect(balance).toBe(12n);
    });

    it('getNFTUri: should fetch cybernetic metadata pointer', async () => {
      const uri = 'ipfs://mcb-bot-42-config';
      mockPublicClient.readContract.mockResolvedValue(uri);
      const result = await getNFTUri(mockPublicClient, 42n);
      expect(result).toBe(uri);
    });

    it('getNFTOwner: should identify current signature holding the unit', async () => {
      mockPublicClient.readContract.mockResolvedValue(mockAddress);
      const owner = await getNFTOwner(mockPublicClient, 1n);
      expect(owner).toBe(mockAddress);
    });
  });

  describe('Asset Management (Writes)', () => {
    it('mintBot: should initiate the safeMint ritual', async () => {
      const uri = "ipfs://soul-bound-metadata";
      mockWalletClient.writeContract.mockResolvedValue('0xmint_hash');
      const hash = await mintBot(mockWalletClient, mockAddress, uri);
      
      expect(mockWalletClient.writeContract).toHaveBeenCalledWith(expect.objectContaining({
        address: ADRS.nft,
        functionName: 'safeMint',
        args: [mockAddress, uri],
        account: mockAddress
      }));
      expect(hash).toBe('0xmint_hash');
    });

    it('setNFTApprovalForAll: should grant nexus marketplace access to units', async () => {
      mockWalletClient.writeContract.mockResolvedValue('0xapproval_hash');
      const hash = await setNFTApprovalForAll(mockWalletClient, mockAddress, mockOperator, true);
      
      expect(mockWalletClient.writeContract).toHaveBeenCalledWith(expect.objectContaining({
        address: ADRS.nft,
        functionName: 'setApprovalForAll',
        args: [mockOperator, true],
        account: mockAddress
      }));
      expect(hash).toBe('0xapproval_hash');
    });
  });
});
