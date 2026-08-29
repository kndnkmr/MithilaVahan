import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <App />
          <Toaster position="top-center" />
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
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

  // Tell a worker to activate immediately.
  const activate = (worker) => worker?.postMessage({ type: 'SKIP_WAITING' });

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        // Case A: a new worker is ALREADY waiting (e.g. installed on a previous
        // visit but never activated because tabs stayed open). This is the
        // "stuck on old version" situation — activate it right now.
        if (reg.waiting && navigator.serviceWorker.controller) {
          activate(reg.waiting);
        }

        // Case B: a new worker is found now — activate it the moment it installs.
        reg.addEventListener('updatefound', () => {
          const sw = reg.installing;
          if (!sw) return;
          sw.addEventListener('statechange', () => {
            if (sw.state === 'installed' && navigator.serviceWorker.controller) {
              activate(sw);
            }
          });
        });

        // Check for a new deploy on load, periodically, and on tab focus.
        const check = () => reg.update().catch(() => {});
        check();
        setInterval(check, 15 * 60 * 1000); // every 15 min (was hourly)
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') check();
        });
      })
      .catch(() => {});
  });
}
