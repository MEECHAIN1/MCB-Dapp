import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { AppStateProvider } from './context/AppState';
import * as Wagmi from 'wagmi';
import { wagmiConfig } from '../lib/wagmiConfig';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <Wagmi.WagmiConfig config={wagmiConfig}>
      <AppStateProvider>
        <HashRouter> {/* Using HashRouter as per guidelines for environments that cannot manipulate URL paths */}
          <App />
        </HashRouter>
      </AppStateProvider>
    </Wagmi.WagmiConfig>
  </React.StrictMode>
);