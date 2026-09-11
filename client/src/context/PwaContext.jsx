// ============================================
// PWA Install Context — one shared "install the app" prompt
// ============================================
// The browser fires `beforeinstallprompt` ONCE, and only the listener active at
// that moment can later trigger the install. If multiple components (navbar,
// home hero, /install page) each listen on their own state, whichever mounts
// first "eats" the event and the others can't install.
//
// So we capture the event a single time at the app root and share it via the
// usePwa() hook — navbar, home strip, and /install page all offer the same
// one-tap install. Mirrors the ProMedicoz pattern.
//
// `beforeinstallprompt` is Chromium-only (Android/desktop Chrome, Edge). It
// never fires on iOS Safari — there `canInstall` stays false and callers fall
// back to the manual "Add to Home Screen" hint.

import { createContext, useContext, useEffect, useState, useCallback } from 'react';

const PwaContext = createContext({
  canInstall: false,
  isInstalled: false,
  promptInstall: async () => false,
});

export function PwaProvider({ children }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(
    typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(display-mode: standalone)').matches
  );

  useEffect(() => {
    const onBeforeInstall = (e) => {
      e.preventDefault(); // keep the event; we decide when to prompt (on a tap)
      setDeferredPrompt(e);
    };
    const onInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  // Fire the native install prompt. Returns true if the user accepted.
  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return false;
    deferredPrompt.prompt();
    try {
      const choice = await deferredPrompt.userChoice;
      setDeferredPrompt(null); // a deferred prompt can only be used once
      return choice && choice.outcome === 'accepted';
    } catch {
      setDeferredPrompt(null);
      return false;
    }
  }, [deferredPrompt]);

  const value = {
    canInstall: !!deferredPrompt && !isInstalled,
    isInstalled,
    promptInstall,
  };

  return <PwaContext.Provider value={value}>{children}</PwaContext.Provider>;
}

export function usePwa() {
  return useContext(PwaContext);
}
