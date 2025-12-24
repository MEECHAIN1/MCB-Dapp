import React from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom';
import { AppStateProvider } from './context/AppState';
import App from './App';
import './input.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}
createRoot(rootElement as HTMLElement).render(
  <React.StrictMode>
    <AppStateProvider>
      <HashRouter> {/* Using HashRouter to avoid server-side routing requirements */}
        <App />
      </HashRouter>
    </AppStateProvider>
  </React.StrictMode>
);
