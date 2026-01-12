import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';

// Senior Engineer: Global boot confirmation for debugging nexus resolution
console.log("%c📡 NEXUS BOOT PROTOCOL INITIATED", "color: #C5A059; font-weight: bold; font-size: 12px;");

const handleFatalError = (error: any) => {
  console.error('Nexus Boot Failure:', error);
  const root = document.getElementById('root');
  if (root) {
    const msg = error?.message || error?.reason || (typeof error === 'string' ? error : 'ไม่สามารถโหลดแอปได้');
    const stack = error?.stack || '';
    
    root.innerHTML = `
      <div style="background: #050505; color: #ff5555; padding: 40px; font-family: 'JetBrains Mono', monospace; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
        <div style="font-size: 48px; margin-bottom: 24px;">⚡</div>
        <h2 style="color: #fff; margin-bottom: 12px; letter-spacing: 0.2em; font-weight: 900;">RITUAL INTERRUPTED</h2>
        <p style="color: #888; max-width: 500px; font-size: 14px; line-height: 1.8; text-transform: uppercase; letter-spacing: 0.1em;">ไม่สามารถโหลดแอปได้ โปรดลองโหลดแอปใหม่อีกครั้ง</p>
        <div style="background: #111; padding: 24px; border-radius: 16px; margin: 32px 0; text-align: left; width: 100%; max-width: 700px; overflow: auto; border: 1px solid #222;">
          <code style="color: #ff5555; font-size: 11px; white-space: pre-wrap;">${msg}${stack ? '\n\n' + stack : ''}</code>
        </div>
        <button onclick="window.location.reload()" style="background: #C5A059; color: #000; border: none; padding: 16px 32px; border-radius: 12px; cursor: pointer; font-weight: 900; text-transform: uppercase; letter-spacing: 0.15em;">เชื่อมต่อใหม่</button>
      </div>
    `;
  }
};

const boot = () => {
  try {
    const rootEl = document.getElementById('root');
    if (!rootEl) return;
    
    if (!React || !ReactDOM) {
      throw new Error("Nexus Framework Parity Failure: Modules not resolved.");
    }

    const root = ReactDOM.createRoot(rootEl);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("%c✅ NEXUS MANIFESTED", "color: #22c55e; font-weight: bold;");
  } catch (err) {
    handleFatalError(err);
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

window.addEventListener('error', (event) => {
  if (event.filename && event.filename.includes('index.tsx')) {
    handleFatalError(event.error);
  }
});

window.addEventListener('unhandledrejection', (event) => {
  handleFatalError(event.reason || new Error("Unhandled promise rejection"));
});