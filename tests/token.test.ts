
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { getTokenBalance, getTokenDecimals, getTokenSymbol, approveToken, transferToken } from '../lib/token';
import { parseUnits, PublicClient, WalletClient, Address } from 'viem';
import { ADRS, MINIMAL_ERC20_ABI } from '../lib/contracts';

describe('Token Service (MCB)', () => {
  const mockAddress = '0x1234567890123456789012345678901234567890' as Address;
  const mockRecipient = '0x0987654321098765432109876543210987654321' as Address;
  
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

  describe('Registry & Telemetry (Reads)', () => {
    it('getTokenBalance: should call contract and return BigInt value', async () => {
      const expectedBalance = parseUnits('100', 18);
      (mockPublicClient.readContract as Mock).mockResolvedValue(expectedBalance);
      
      const balance = await getTokenBalance(mockPublicClient as PublicClient, mockAddress);
      
      expect(mockPublicClient.readContract).toHaveBeenCalledWith({
        address: ADRS.token,
        abi: MINIMAL_ERC20_ABI,
        functionName: 'balanceOf',
        args: [mockAddress],
      });
      expect(balance).toBe(expectedBalance);
    });

    it('getTokenDecimals: should fetch precision metadata', async () => {
      (mockPublicClient.readContract as Mock).mockResolvedValue(18);
      const decimals = await getTokenDecimals(mockPublicClient as PublicClient);
      
      expect(mockPublicClient.readContract).toHaveBeenCalledWith({
        address: ADRS.token,
        abi: MINIMAL_ERC20_ABI,
        functionName: 'decimals',
      });
      expect(decimals).toBe(18);
    });

    it('getTokenSymbol: should fetch currency designation', async () => {
      (mockPublicClient.readContract as Mock).mockResolvedValue('MCB');
      const symbol = await getTokenSymbol(mockPublicClient as PublicClient);
      
      expect(mockPublicClient.readContract).toHaveBeenCalledWith({
        address: ADRS.token,
        abi: MINIMAL_ERC20_ABI,
        functionName: 'symbol',
      });
      expect(symbol).toBe('MCB');
    });

    it('Error Handling: should propagate RPC failures', async () => {
      (mockPublicClient.readContract as Mock).mockRejectedValue(new Error('Connection Interrupted'));
      await expect(getTokenBalance(mockPublicClient as PublicClient, mockAddress)).rejects.toThrow('Connection Interrupted');
    });
  });

  describe('Protocol Management (Writes)', () => {
    it('approveToken: should initiate approval ritual for the staking core', async () => {
      const mockHash = '0xapprove_ritual_hash';
      const amount = parseUnits('500', 18);
      (mockWalletClient.writeContract as Mock).mockResolvedValue(mockHash);
      
      const hash = await approveToken(mockWalletClient as WalletClient, mockAddress, amount);
      
      expect(mockWalletClient.writeContract).toHaveBeenCalledWith({
        address: ADRS.token,
        abi: MINIMAL_ERC20_ABI,
        functionName: 'approve',
        args: [ADRS.staking, amount],
        account: mockAddress,
      });
      expect(hash).toBe(mockHash);
    });

    it('transferToken: should execute token migration ritual', async () => {
      const mockHash = '0xtransfer_ritual_hash';
      const amount = parseUnits('10', 18);
      (mockWalletClient.writeContract as Mock).mockResolvedValue(mockHash);
      
      const hash = await transferToken(mockWalletClient as WalletClient, mockAddress, mockRecipient, amount);
      
      expect(mockWalletClient.writeContract).toHaveBeenCalledWith({
        address: ADRS.token,
        abi: MINIMAL_ERC20_ABI,
        functionName: 'transfer',
        args: [mockRecipient, amount],
        account: mockAddress,
      });
      expect(hash).toBe(mockHash);
    });
  });
});
