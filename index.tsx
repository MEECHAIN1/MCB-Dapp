
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.tsx';

// Global polyfill for process.env to ensure SDK compatibility.
// Vite replaces process.env.API_KEY during build, but this ensures runtime safety.
if (typeof window !== 'undefined' && !(window as any).process) {
  (window as any).process = { 
    env: { 
      API_KEY: process.env.API_KEY || '' 
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
