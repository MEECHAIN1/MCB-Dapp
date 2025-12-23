
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Global polyfill for process.env to ensure SDK compatibility in Vite/ESM environments.
// This prevents 'Uncaught ReferenceError: process is not defined'.
// Fix: Use type assertion on window to resolve "Property 'process' does not exist on type 'Window & typeof globalThis'" error.
if (typeof window !== 'undefined' && !(window as any).process) {
  (window as any).process = { 
    env: { 
      API_KEY: (import.meta as any).env?.VITE_GEMINI_API_KEY || '' 
    } 
  };
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
