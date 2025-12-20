
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { ThreeElements } from '@react-three/fiber';

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

  // Fix: Augmenting NodeJS namespace to provide types for process.env
  namespace NodeJS {
    interface ProcessEnv {
      API_KEY: string;
      [key: string]: string | undefined;
    }
  }

  // Fix: Augment global JSX namespace to include React Three Fiber intrinsic elements
  // We extend the global namespace carefully to ensure standard HTML elements are preserved.
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

// Fix: Removed the problematic declare module 'react' block that was causing 
// property 'div' does not exist errors by shadowing the core React JSX types.
