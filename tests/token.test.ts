
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { describe, it, expect, vi } from 'vitest';
import { getTokenBalance, approveToken } from '../lib/token';
import { parseUnits } from 'viem';
import { ADRS } from '../lib/contracts';

describe('Token Service', () => {
  const mockAddress = '0x1234567890123456789012345678901234567890';

  it('fetches balance correctly using the public client', async () => {
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

  it('initiates approval for the staking contract correctly', async () => {
    const mockWalletClient = {
      writeContract: vi.fn().mockResolvedValue('0xhash'),
    };
    const amount = parseUnits('50', 18);

    const hash = await approveToken(mockWalletClient as any, mockAddress, amount);
    
    expect(mockWalletClient.writeContract).toHaveBeenCalledWith(expect.objectContaining({
      address: ADRS.token,
      functionName: 'approve',
      args: [ADRS.staking, amount],
      account: mockAddress
    }));
    expect(hash).toBe('0xhash');
  });
});
