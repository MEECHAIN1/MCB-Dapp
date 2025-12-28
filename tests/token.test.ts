import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { getTokenBalance, getTokenDecimals, getTokenSymbol, approveToken, transferToken } from '../lib/token';
import { parseUnits, PublicClient, WalletClient, Address } from 'viem';
import { ADRS, MINIMAL_ERC20_ABI } from '../lib/contracts';

describe('MCB Token Service (Comprehensive)', () => {
  const mockAddr = '0x1234567890123456789012345678901234567890' as Address;
  const mockTo = '0x0987654321098765432109876543210987654321' as Address;
  
  let mockPublic: Partial<PublicClient>;
  let mockWallet: Partial<WalletClient>;

  beforeEach(() => {
    mockPublic = { readContract: vi.fn() as Mock };
    mockWallet = { writeContract: vi.fn() as Mock };
    vi.clearAllMocks();
  });

  describe('Read Operations', () => {
    it('getTokenBalance: fetches ledger data correctly', async () => {
      const balance = parseUnits('500', 18);
      (mockPublic.readContract as Mock).mockResolvedValue(balance);
      const result = await getTokenBalance(mockPublic as PublicClient, mockAddr);
      expect(mockPublic.readContract).toHaveBeenCalledWith({
        address: ADRS.token,
        abi: MINIMAL_ERC20_ABI,
        functionName: 'balanceOf',
        args: [mockAddr],
      });
      expect(result).toBe(balance);
    });

    it('getTokenDecimals: retrieves correct precision', async () => {
      (mockPublic.readContract as Mock).mockResolvedValue(18);
      const result = await getTokenDecimals(mockPublic as PublicClient);
      expect(mockPublic.readContract).toHaveBeenCalledWith({
        address: ADRS.token,
        abi: MINIMAL_ERC20_ABI,
        functionName: 'decimals',
      });
      expect(result).toBe(18);
    });

    it('getTokenSymbol: retrieves asset symbol', async () => {
      (mockPublic.readContract as Mock).mockResolvedValue('MCB');
      const result = await getTokenSymbol(mockPublic as PublicClient);
      expect(mockPublic.readContract).toHaveBeenCalledWith({
        address: ADRS.token,
        abi: MINIMAL_ERC20_ABI,
        functionName: 'symbol',
      });
      expect(result).toBe('MCB');
    });
  });

  describe('Write Operations', () => {
    it('approveToken: executes authorization correctly', async () => {
      const amount = 1000n;
      (mockWallet.writeContract as Mock).mockResolvedValue('0xtxhash');
      const result = await approveToken(mockWallet as WalletClient, mockAddr, amount);
      expect(mockWallet.writeContract).toHaveBeenCalledWith({
        address: ADRS.token,
        abi: MINIMAL_ERC20_ABI,
        functionName: 'approve',
        args: [ADRS.staking, amount],
        account: mockAddr,
      });
      expect(result).toBe('0xtxhash');
    });

    it('transferToken: executes migration correctly', async () => {
      const amount = 50n;
      (mockWallet.writeContract as Mock).mockResolvedValue('0xtxhash');
      const result = await transferToken(mockWallet as WalletClient, mockAddr, mockTo, amount);
      expect(mockWallet.writeContract).toHaveBeenCalledWith({
        address: ADRS.token,
        abi: MINIMAL_ERC20_ABI,
        functionName: 'transfer',
        args: [mockTo, amount],
        account: mockAddr,
      });
      expect(result).toBe('0xtxhash');
    });
  });
});