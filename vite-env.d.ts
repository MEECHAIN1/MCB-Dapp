
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// Fix: Remove direct reference to potentially missing vite/client and provide essential types
import { ThreeElements } from '@react-three/fiber'

declare global {
  // Define ImportMetaEnv for use with Vite
  interface ImportMetaEnv {
    readonly VITE_RPC_URL: string;
    readonly VITE_CHAIN_ID: string;
    readonly VITE_CHAIN_NAME: string;
    readonly VITE_NFT_ADDRESS: string;
    readonly VITE_STAKING_ADDRESS: string;
    readonly VITE_TOKEN_ADDRESS: string;
    readonly VITE_MARKETPLACE_ADDRESS: string;
  }

  // Augment ImportMeta to include env
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }

  // Augment JSX.IntrinsicElements for React Three Fiber
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}
