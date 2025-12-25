/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Helper to safely get environment variables from browser window.process
const getEnv = (key: string, fallback: string): string => {
  try {
    // Check window.process.env first (defined in index.html)
    const win = window as any;
    if (win.process?.env?.[key]) return win.process.env[key];
    
    // Check import.meta.env as fallback for local dev
    const metaEnv = (import.meta as any).env;
    if (metaEnv && metaEnv[key]) return metaEnv[key];
  } catch (e) {
    // Silent fail
  }
  return fallback;
};

export const ADRS = {
  nft: getEnv("VITE_NFT_ADDRESS", "0x5FbDB2315678afecb367f032d93F642f64180aa3") as `0x${string}`,
  marketplace: getEnv("VITE_MARKETPLACE_ADDRESS", "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9") as `0x${string}`,
  staking: getEnv("VITE_STAKING_ADDRESS", "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512") as `0x${string}`,
  token: getEnv("VITE_TOKEN_ADDRESS", "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512") as `0x${string}`, 
  miner: getEnv("VITE_MINER_ADDRESS", "0x70997970C51812dc3A010C7d01b50e0d17dc79C8") as `0x${string}`,
};

export const MINIMAL_ERC20_ABI = [
  { name: 'balanceOf', type: 'function', inputs: [{ name: 'account', type: 'address' }], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { name: 'approve', type: 'function', inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ type: 'bool' }], stateMutability: 'nonpayable' },
  { name: 'transfer', type: 'function', inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ type: 'bool' }], stateMutability: 'nonpayable' },
  { name: 'decimals', type: 'function', inputs: [], outputs: [{ type: 'uint8' }], stateMutability: 'view' },
  { name: 'symbol', type: 'function', inputs: [], outputs: [{ type: 'string' }], stateMutability: 'view' },
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