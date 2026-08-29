import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster, default as toast } from 'react-hot-toast';
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

// Register the PWA service worker (production only).
//
// This mirrors the ProMedicoz auto-update approach exactly, because it's the
// proven one: the service worker itself calls skipWaiting() inside its
// 'install' handler (see public/sw.js), so a new build ACTIVATES ITSELF the
// moment it installs — we don't rely on the page messaging it (that was the
// fragile part that left devices stuck on an old cached build). Here we just
// (1) check for updates on load / periodically / on return to the app, and
// (2) reload once when the new worker takes control.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        // Check for a new deploy on load...
        reg.update();
        // ...periodically while the tab is open...
        setInterval(() => reg.update(), 15 * 60 * 1000);
        // ...and — most importantly — right when the user returns to the app
        // (switches back to the tab, reopens from the home screen, unlocks the
        // phone). This is what actually gets a returning user the latest build
        // within a second or two.
        const checkOnReturn = () => {
          if (document.visibilityState === 'visible') reg.update();
        };
        document.addEventListener('visibilitychange', checkOnReturn);
        window.addEventListener('focus', checkOnReturn);
      })
      .catch((err) => console.log('Service Worker registration failed:', err));

    // When a new service worker takes control (a new deploy activated itself),
    // show a brief message and reload ONCE so the user immediately gets the
    // latest app — no manual cache clearing needed.
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      try {
        toast.loading('Updating to the latest version…', { duration: 1500 });
      } catch (e) { /* toast not critical */ }
      setTimeout(() => window.location.reload(), 1200);
    });
  });
}
