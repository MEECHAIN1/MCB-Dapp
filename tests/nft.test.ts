import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { getNFTBalance, getNFTUri, getNFTOwner, setNFTApprovalForAll, mintBot } from '../lib/nft';
import { Address, PublicClient, WalletClient } from 'viem';
import { ADRS, MINIMAL_NFT_ABI } from '../lib/contracts';

describe('MeeBot NFT Service (Comprehensive)', () => {
  const mockAddr = '0x1111111111111111111111111111111111111111' as Address;
  const mockOp = '0x2222222222222222222222222222222222222222' as Address;
  const mockTokenId = 1n;
  
  let mockPublic: Partial<PublicClient>;
  let mockWallet: Partial<WalletClient>;

  beforeEach(() => {
    mockPublic = { readContract: vi.fn() as Mock };
    mockWallet = { writeContract: vi.fn() as Mock };
    vi.clearAllMocks();
  });

  describe('Read Operations', () => {
    it('getNFTBalance: returns correct fleet count', async () => {
      (mockPublic.readContract as Mock).mockResolvedValue(5n);
      const res = await getNFTBalance(mockPublic as PublicClient, mockAddr);
      expect(res).toBe(5n);
      expect(mockPublic.readContract).toHaveBeenCalledWith({
        address: ADRS.nft,
        abi: MINIMAL_NFT_ABI,
        functionName: 'balanceOf',
        args: [mockAddr],
      });
    });

    it('getNFTUri: fetches correct metadata link', async () => {
      const uri = "ipfs://ritual-data";
      (mockPublic.readContract as Mock).mockResolvedValue(uri);
      const res = await getNFTUri(mockPublic as PublicClient, mockTokenId);
      expect(mockPublic.readContract).toHaveBeenCalledWith({
        address: ADRS.nft,
        abi: MINIMAL_NFT_ABI,
        functionName: 'tokenURI',
        args: [mockTokenId],
      });
      expect(res).toBe(uri);
    });

    it('getNFTOwner: identifies unit owner correctly', async () => {
      (mockPublic.readContract as Mock).mockResolvedValue(mockAddr);
      const res = await getNFTOwner(mockPublic as PublicClient, mockTokenId);
      expect(mockPublic.readContract).toHaveBeenCalledWith({
        address: ADRS.nft,
        abi: MINIMAL_NFT_ABI,
        functionName: 'ownerOf',
        args: [mockTokenId],
      });
      expect(res).toBe(mockAddr);
    });
  });

  describe('Write Operations', () => {
    it('mintBot: executes forge ritual correctly', async () => {
      const uri = "ipfs://new-bot";
      (mockWallet.writeContract as Mock).mockResolvedValue('0xhash');
      const res = await mintBot(mockWallet as WalletClient, mockAddr, uri);
      expect(mockWallet.writeContract).toHaveBeenCalledWith({
        address: ADRS.nft,
        abi: MINIMAL_NFT_ABI,
        functionName: 'safeMint',
        args: [mockAddr, uri],
        account: mockAddr,
      });
      expect(res).toBe('0xhash');
    });

    it('setNFTApprovalForAll: authorizes nexus marketplace', async () => {
      (mockWallet.writeContract as Mock).mockResolvedValue('0xhash');
      const res = await setNFTApprovalForAll(mockWallet as WalletClient, mockAddr, mockOp, true);
      expect(mockWallet.writeContract).toHaveBeenCalledWith({
        address: ADRS.nft,
        abi: MINIMAL_NFT_ABI,
        functionName: 'setApprovalForAll',
        args: [mockOp, true],
        account: mockAddr,
      });
      expect(res).toBe('0xhash');
    });
  });
});