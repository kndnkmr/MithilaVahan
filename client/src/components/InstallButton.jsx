// "Install app" affordance.
//  - Android/Chrome: captures the beforeinstallprompt event and shows a button
//    that triggers the native install prompt.
//  - iOS/Safari: no such event exists, so we show a short "Add to Home Screen"
//    instruction instead (only when not already installed).
//  - Already installed (standalone display): render nothing.

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

function isStandalone() {
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.navigator.standalone === true // iOS
  );
}

function isIOS() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent) && !window.MSStream;
}

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed, setInstalled] = useState(isStandalone());

  useEffect(() => {
    if (installed) return;

    const onPrompt = (e) => {
      e.preventDefault(); // stop Chrome's mini-infobar; we'll trigger it ourselves
      setDeferredPrompt(e);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, [installed]);

  if (installed) return null;

  const handleClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      return;
    }
    if (isIOS()) {
      toast(
        'To install: tap the Share button, then "Add to Home Screen".',
        { duration: 6000, icon: '📲' }
      );
      return;
    }
    // Desktop/other browsers where the prompt isn't available yet.
    toast('Open this site in Chrome on your phone to install the app.', { duration: 5000 });
  };

  // On iOS we always show the button (to surface the instructions). Elsewhere,
  // show it once the browser has offered install (deferredPrompt captured).
  if (!deferredPrompt && !isIOS()) return null;

  return (
    <button
      onClick={handleClick}
      className="text-brand-600 border border-brand-500 px-2.5 py-1 rounded-md text-xs font-medium hover:bg-brand-50"
    >
      📲 Install
    </button>
  );
}
