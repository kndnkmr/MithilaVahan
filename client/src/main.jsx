import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster position="top-center" />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// Register the PWA service worker (production only — avoids caching headaches
// during dev with Vite's HMR).
//
// Auto-update: the old registration never checked for new versions after the
// first load, so users kept seeing stale JS/CSS after a deploy (the "I don't
// see my changes" problem). Now we:
//   1. register, then poll for an updated SW periodically + whenever the tab
//      regains focus,
//   2. as soon as a new SW finishes installing, ask it to skipWaiting,
//   3. reload the page ONCE when the new SW takes control (controllerchange),
//      so everyone gets the latest build automatically.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloading) return;
    reloading = true;
    window.location.reload();
  });

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        // A new worker was found — tell it to activate immediately once ready.
        reg.addEventListener('updatefound', () => {
          const sw = reg.installing;
          if (!sw) return;
          sw.addEventListener('statechange', () => {
            // "installed" + an existing controller => this is an UPDATE (not
            // the first install), so activate it now.
            if (sw.state === 'installed' && navigator.serviceWorker.controller) {
              reg.waiting?.postMessage({ type: 'SKIP_WAITING' });
            }
          });
        });

        // Check for a new deploy periodically and when the user returns to the tab.
        const check = () => reg.update().catch(() => {});
        setInterval(check, 60 * 60 * 1000); // hourly
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') check();
        });
      })
      .catch(() => {});
  });
}
