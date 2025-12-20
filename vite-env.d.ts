
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

  // Fix: Augmenting NodeJS namespace to provide types for process.env without redeclaring the global process variable to avoid block-scoped conflict
  namespace NodeJS {
    interface ProcessEnv {
      API_KEY: string;
      [key: string]: string | undefined;
    }
  }

  // Fix: Augment global JSX namespace to include React Three Fiber intrinsic elements (mesh, sphereGeometry, lights, etc.)
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }

  // Fix: Support for React 18+ global JSX namespace augmentation
  namespace React {
    namespace JSX {
      interface IntrinsicElements extends ThreeElements {}
    }
  }
}

// Fix: Augment React's JSX namespace for module-based environments to resolve "Property does not exist" errors in components
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}
