import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { stakeTokens, getEarnedRewards, claimRewards, withdrawTokens, getStakedBalance, getRewardRate } from '../lib/staking';
import { Address, PublicClient, WalletClient, parseUnits } from 'viem';
import { ADRS, MINIMAL_STAKING_ABI } from '../lib/contracts';

describe('Staking Ritual Service (Comprehensive)', () => {
  const mockAddr = '0x1234123412341234123412341234123412341234' as Address;
  
  let mockPublic: Partial<PublicClient>;
  let mockWallet: Partial<WalletClient>;

  beforeEach(() => {
    mockPublic = { readContract: vi.fn() as Mock };
    mockWallet = { writeContract: vi.fn() as Mock };
    vi.clearAllMocks();
  });

  describe('Read Operations', () => {
    it('getEarnedRewards: fetches pending manifestations', async () => {
      const earned = parseUnits('10', 18);
      (mockPublic.readContract as Mock).mockResolvedValue(earned);
      const res = await getEarnedRewards(mockPublic as PublicClient, mockAddr);
      expect(mockPublic.readContract).toHaveBeenCalledWith({
        address: ADRS.staking,
        abi: MINIMAL_STAKING_ABI,
        functionName: 'earned',
        args: [mockAddr],
      });
      expect(res).toBe(earned);
    });

    it('getStakedBalance: retrieves current stake volume', async () => {
      const staked = parseUnits('100', 18);
      (mockPublic.readContract as Mock).mockResolvedValue(staked);
      const res = await getStakedBalance(mockPublic as PublicClient, mockAddr);
      expect(mockPublic.readContract).toHaveBeenCalledWith({
        address: ADRS.staking,
        abi: MINIMAL_STAKING_ABI,
        functionName: 'balanceOf',
        args: [mockAddr],
      });
      expect(res).toBe(staked);
    });

    it('getRewardRate: retrieves global emission speed', async () => {
      const rate = 100n;
      (mockPublic.readContract as Mock).mockResolvedValue(rate);
      const res = await getRewardRate(mockPublic as PublicClient);
      expect(mockPublic.readContract).toHaveBeenCalledWith({
        address: ADRS.staking,
        abi: MINIMAL_STAKING_ABI,
        functionName: 'rewardRate',
      });
      expect(res).toBe(rate);
    });
  });

  describe('Write Operations', () => {
    it('stakeTokens: initiates sacrifice ritual', async () => {
      const amount = 1000n;
      (mockWallet.writeContract as Mock).mockResolvedValue('0xtx');
      const res = await stakeTokens(mockWallet as WalletClient, mockAddr, amount);
      expect(mockWallet.writeContract).toHaveBeenCalledWith({
        address: ADRS.staking,
        abi: MINIMAL_STAKING_ABI,
        functionName: 'stake',
        args: [amount],
        account: mockAddr,
      });
      expect(res).toBe('0xtx');
    });

    it('withdrawTokens: initiates recovery ritual', async () => {
      const amount = 500n;
      (mockWallet.writeContract as Mock).mockResolvedValue('0xtx');
      const res = await withdrawTokens(mockWallet as WalletClient, mockAddr, amount);
      expect(mockWallet.writeContract).toHaveBeenCalledWith({
        address: ADRS.staking,
        abi: MINIMAL_STAKING_ABI,
        functionName: 'withdraw',
        args: [amount],
        account: mockAddr,
      });
      expect(res).toBe('0xtx');
    });

    it('claimRewards: manifests blessing ritual', async () => {
      (mockWallet.writeContract as Mock).mockResolvedValue('0xtx');
      const res = await claimRewards(mockWallet as WalletClient, mockAddr);
      expect(mockWallet.writeContract).toHaveBeenCalledWith({
        address: ADRS.staking,
        abi: MINIMAL_STAKING_ABI,
        functionName: 'getReward',
        account: mockAddr,
      });
      expect(res).toBe('0xtx');
    });
  });
});