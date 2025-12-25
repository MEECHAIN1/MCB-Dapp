/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

if (typeof window !== 'undefined' && !(window as any).process) {
  (window as any).process = { 
    env: { 
      NODE_ENV: 'development',
      API_KEY: (process as any).env?.VITE_GEMINI_API_KEY || '' 
    } 
  };
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// 🚀 ยิง Render ไปที่ Root
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
