/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Helper to safely get environment variables with guaranteed string return and validation
const getEnv = (key: string, fallback: string): string => {
  try {
    const win = window as any;
    // Priority: 1. window.process.env (defined in index.html) 2. import.meta.env 3. fallback
    let val = (win.process?.env?.[key]) || (import.meta as any).env?.[key] || fallback;
    
    // Safety check: Ensure we return a string and handle non-string types gracefully
    if (typeof val !== 'string') {
      val = String(val || fallback);
    }
    
    // Ensure the value is not an empty string or 'undefined' string
    if (!val || val === 'undefined' || val === 'null') {
      return fallback;
    }
    
    return val;
  } catch (e) {
    return fallback;
  }
};

// Ensure address is a valid 0x string to prevent .trim() failures in viem/wagmi
const ensureAddress = (addr: string, fallback: string): `0x${string}` => {
  const clean = String(addr || fallback).trim();
  if (clean.startsWith('0x')) return clean as `0x${string}`;
  return `0x${clean}` as `0x${string}`;
};

export const ADRS = {
  nft: ensureAddress(getEnv("VITE_NFT_ADDRESS", "0x5FbDB2315678afecb367f032d93F642f64180aa3"), "0x5FbDB2315678afecb367f032d93F642f64180aa3"),
  marketplace: ensureAddress(getEnv("VITE_MARKETPLACE_ADDRESS", "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9"), "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9"),
  staking: ensureAddress(getEnv("VITE_STAKING_ADDRESS", "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"), "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"),
  token: ensureAddress(getEnv("VITE_TOKEN_ADDRESS", "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"), "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"), 
  miner: ensureAddress(getEnv("VITE_MINER_ADDRESS", "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"), "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"),
};

export const MINIMAL_ERC20_ABI = [
  { name: 'balanceOf', type: 'function', inputs: [{ name: 'account', type: 'address' }], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { name: 'approve', type: 'function', inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ type: 'bool' }], stateMutability: 'nonpayable' },
  { name: 'transfer', type: 'function', inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ type: 'bool' }], stateMutability: 'nonpayable' },
  { name: 'decimals', type: 'function', inputs: [], outputs: [{ type: 'uint8' }], stateMutability: 'view' },
  { name: 'symbol', type: 'function', inputs: [], outputs: [{ type: 'string' }], stateMutability: 'view' },
  { name: 'allowance', type: 'function', inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
] as const;

export const MINIMAL_NFT_ABI = [
  { name: 'safeMint', type: 'function', inputs: [{ name: 'to', type: 'address' }, { name: 'uri', type: 'string' }], outputs: [], stateMutability: 'nonpayable' },
  { name: 'balanceOf', type: 'function', inputs: [{ name: 'owner', type: 'address' }], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { name: 'ownerOf', type: 'function', inputs: [{ name: 'tokenId', type: 'uint256' }], outputs: [{ type: 'address' }], stateMutability: 'view' },
  { name: 'tokenURI', type: 'function', inputs: [{ name: 'tokenId', type: 'uint256' }], outputs: [{ type: 'string' }], stateMutability: 'view' },
  { name: 'setApprovalForAll', type: 'function', inputs: [{ name: 'operator', type: 'address' }, { name: 'approved', type: 'bool' }], outputs: [], stateMutability: 'nonpayable' },
  { name: 'isApprovedForAll', type: 'function', inputs: [{ name: 'owner', type: 'address' }, { name: 'operator', type: 'address' }], outputs: [{ type: 'bool' }], stateMutability: 'view' },
  { name: 'Transfer', type: 'event', inputs: [{ name: 'from', type: 'address', indexed: true }, { name: 'to', type: 'address', indexed: true }, { name: 'tokenId', type: 'uint256', indexed: true }] },
] as const;

export const MINIMAL_STAKING_ABI = [
  { name: 'stake', type: 'function', inputs: [{ name: 'amount', type: 'uint256' }], outputs: [], stateMutability: 'nonpayable' },
  { name: 'withdraw', type: 'function', inputs: [{ name: 'amount', type: 'uint256' }], outputs: [], stateMutability: 'nonpayable' },
  { name: 'getReward', type: 'function', inputs: [], outputs: [], stateMutability: 'nonpayable' },
  { name: 'earned', type: 'function', inputs: [{ name: 'account', type: 'address' }], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { name: 'rewardRate', type: 'function', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { name: 'balanceOf', type: 'function', inputs: [{ name: 'account', type: 'address' }], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
] as const;

export const MINIMAL_MARKETPLACE_ABI = [
  { name: 'listNFT', type: 'function', inputs: [{ name: 'tokenId', type: 'uint256' }, { name: 'price', type: 'uint256' }], outputs: [], stateMutability: 'nonpayable' },
  { name: 'buyNFT', type: 'function', inputs: [{ name: 'tokenId', type: 'uint256' }], outputs: [], stateMutability: 'payable' },
  { name: 'cancelListing', type: 'function', inputs: [{ name: 'tokenId', type: 'uint256' }], outputs: [], stateMutability: 'nonpayable' },
  { name: 'listings', type: 'function', inputs: [{ name: 'tokenId', type: 'uint256' }], outputs: [{ name: 'seller', type: 'address' }, { name: 'price', type: 'uint256' }, { name: 'isActive', type: 'bool' }], stateMutability: 'view' },
] as const;

export const MINIMAL_MINER_ABI = [
  { name: 'ritualMint', type: 'function', inputs: [], outputs: [], stateMutability: 'nonpayable' },
] as const;