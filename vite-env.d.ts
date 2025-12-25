
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// Fix: Removed @react-three/fiber import as it's no longer needed for manual JSX augmentation
// which was causing shadowing issues with standard React HTML elements.

export {};

declare global {
  // Manual definition for Vite's ImportMetaEnv to resolve missing vite/client types
  interface ImportMetaEnv {
    readonly VITE_RPC_URL: string;
    readonly VITE_CHAIN_ID: string;
    readonly VITE_CHAIN_NAME: string;
    readonly VITE_NFT_ADDRESS: string;
    readonly VITE_STAKING_ADDRESS: string;
    readonly VITE_TOKEN_ADDRESS: string;
    readonly VITE_MARKETPLACE_ADDRESS: string;
    readonly VITE_EXPLORER_URL: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }

  namespace NodeJS {
    interface ProcessEnv {
      API_KEY: string;
      [key: string]: string | undefined;
    }
  }

  // Fix: Removed the problematic JSX namespace augmentation that shadowed standard HTML elements.
  // Standard HTML elements (div, p, button, etc.) are now correctly provided by React's default types.
  // Three.js elements are handled via local string aliases in components like QuantumScene.tsx
  // to maintain type safety without conflicting with standard DOM elements.
}

// Fix: Removed the problematic declare module 'react' block that was causing 
// property 'div' does not exist errors by shadowing the core React JSX types.
