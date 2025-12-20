
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { ThreeElements } from '@react-three/fiber';

declare global {
  // Fix: Provide internal definition for Vite's ImportMetaEnv to resolve type errors
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

  // Fix: Augment global JSX namespace to include React Three Fiber intrinsic elements
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

// Fix: Augment React's JSX namespace for modern React environments to prevent "Property does not exist" errors on intrinsic R3F elements
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}
