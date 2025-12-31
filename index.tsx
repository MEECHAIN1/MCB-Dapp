import React from 'react';
import ReactDOM from 'react-dom/client';
import { Buffer } from 'buffer';
import App from './App';

/**
 * MeeChain Terminal Initialization Sequence
 * Standard ESM bootstrapper for direct browser execution.
 */

// Critical polyfills for Web3 libraries - ensure they are attached to window
(window as any).Buffer = Buffer;
(window as any).global = window;

const handleFatalError = (error: any) => {
  console.error('Terminal Initialization Failure:', error)
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="background: #050505; color: #ff5555; padding: 40px; font-family: 'JetBrains Mono', monospace; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
        <div style="font-size: 40px; margin-bottom: 20px;">⚡</div>
        <h2 style="color: #fff; margin-bottom: 10px; letter-spacing: 0.1em;">RITUAL INTERRUPTED</h2>
        <p style="color: #666; max-width: 500px; font-size: 13px; line-height: 1.6;">The dimensional bridge could not be established. A fatal protocol error occurred during initialization.</p>
        <div style="background: #111; padding: 20px; border-radius: 12px; margin: 20px 0; text-align: left; width: 100%; max-width: 700px; overflow: auto; border: 1px solid #222;">
          <code style="color: #ff5555; font-size: 11px; white-space: pre-wrap;">${error?.message || String(error)}</code>
        </div>
        <button onclick="window.location.reload()" style="background: #C5A059; color: #000; border: none; padding: 14px 28px; border-radius: 12px; cursor: pointer; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; transition: 0.2s; box-shadow: 0 0 20px rgba(197,160,89,0.2);">Retry Connection</button>
      </div>
    `;
  }
};

const boot = () => {
  console.log("Nexus Boot Sequence Initiated...");
  try {
    const rootEl = document.getElementById('root');
    if (!rootEl) throw new Error("Terminal Root (DOM #root) not found");
    
    // Explicitly check for framework readiness
    if (typeof React === 'undefined' || typeof ReactDOM === 'undefined') {
      throw new Error("Framework parity failure: React modules not resolved by ESM loader.");
    }

    const root = ReactDOM.createRoot(rootEl);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("Nexus UI Thread Manifested.");
  } catch (err) {
    handleFatalError(err);
  }
};

// Listen for global unhandled module errors (like 404s in importmap)
window.addEventListener('error', (event) => {
  if (event.message.includes('Script error') || event.message.includes('import')) {
    handleFatalError(new Error("Module resolution failed. Check the network tab for 404 errors in dependency resolution."));
  }
});

// Use immediate execution or DOM check
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}