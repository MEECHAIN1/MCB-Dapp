
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { describe, it, expect, vi } from 'vitest';
import { getNFTBalance, getNFTUri } from '../lib/nft';
import { ADRS } from '../lib/contracts';

describe('NFT Service', () => {
  const mockAddress = '0x1234567890123456789012345678901234567890';

  it('returns collection count from the correct NFT contract', async () => {
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

  it('fetches token URI for specific bot IDs', async () => {
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
});
