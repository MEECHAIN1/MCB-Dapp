
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { getNFTBalance, getNFTUri, getNFTOwner, setNFTApprovalForAll, mintBot } from '../lib/nft';
import { Address, PublicClient, WalletClient } from 'viem';
import { ADRS, MINIMAL_NFT_ABI } from '../lib/contracts';

describe('MCB-Bot Asset Service', () => {
  const mockAddress = '0x1234567890123456789012345678901234567890' as Address;
  const mockOperator = '0x0987654321098765432109876543210987654321' as Address;
  
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

  describe('Asset Telemetry (Reads)', () => {
    it('getNFTBalance: should return BigInt count of owned units', async () => {
      (mockPublicClient.readContract as Mock).mockResolvedValue(5n);
      const balance = await getNFTBalance(mockPublicClient as PublicClient, mockAddress);
      
      expect(mockPublicClient.readContract).toHaveBeenCalledWith({
        address: ADRS.nft,
        abi: MINIMAL_NFT_ABI,
        functionName: 'balanceOf',
        args: [mockAddress],
      });
      expect(balance).toBe(5n);
    });

    it('getNFTUri: should retrieve metadata soul pointer', async () => {
      const uri = 'ipfs://soul-metadata-v1';
      (mockPublicClient.readContract as Mock).mockResolvedValue(uri);
      const result = await getNFTUri(mockPublicClient as PublicClient, 42n);
      
      expect(mockPublicClient.readContract).toHaveBeenCalledWith({
        address: ADRS.nft,
        abi: MINIMAL_NFT_ABI,
        functionName: 'tokenURI',
        args: [42n],
      });
      expect(result).toBe(uri);
    });

    it('getNFTOwner: should identify current unit guardian', async () => {
      (mockPublicClient.readContract as Mock).mockResolvedValue(mockAddress);
      const owner = await getNFTOwner(mockPublicClient as PublicClient, 1n);
      
      expect(mockPublicClient.readContract).toHaveBeenCalledWith({
        address: ADRS.nft,
        abi: MINIMAL_NFT_ABI,
        functionName: 'ownerOf',
        args: [1n],
      });
      expect(owner).toBe(mockAddress);
    });
  });

  describe('Asset Rituals (Writes)', () => {
    it('mintBot: should initiate unit forge sequence', async () => {
      const mockHash = '0xmint_success_hash';
      const uri = "ipfs://new-bot-soul";
      (mockWalletClient.writeContract as Mock).mockResolvedValue(mockHash);
      
      const hash = await mintBot(mockWalletClient as WalletClient, mockAddress, uri);
      
      expect(mockWalletClient.writeContract).toHaveBeenCalledWith({
        address: ADRS.nft,
        abi: MINIMAL_NFT_ABI,
        functionName: 'safeMint',
        args: [mockAddress, uri],
        account: mockAddress,
      });
      expect(hash).toBe(mockHash);
    });

    it('setNFTApprovalForAll: should authorize nexus marketplace operator', async () => {
      const mockHash = '0xapproval_success_hash';
      (mockWalletClient.writeContract as Mock).mockResolvedValue(mockHash);
      
      const hash = await setNFTApprovalForAll(mockWalletClient as WalletClient, mockAddress, mockOperator, true);
      
      expect(mockWalletClient.writeContract).toHaveBeenCalledWith({
        address: ADRS.nft,
        abi: MINIMAL_NFT_ABI,
        functionName: 'setApprovalForAll',
        args: [mockOperator, true],
        account: mockAddress,
      });
      expect(hash).toBe(mockHash);
    });
  });
});
