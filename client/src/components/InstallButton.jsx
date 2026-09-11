// "Install app" affordance (navbar).
//  - Chromium (Android/desktop Chrome, Edge): one-tap native install via the
//    shared PwaContext, so it never fights the navbar/home/install page for the
//    one-time beforeinstallprompt event.
//  - iOS/Safari: no such event — show a short "Add to Home Screen" hint.
//  - Already installed: render nothing.

import toast from 'react-hot-toast';
import { usePwa } from '../context/PwaContext';

function isIOS() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent) && !window.MSStream;
}

export default function InstallButton() {
  const { canInstall, isInstalled, promptInstall } = usePwa();

  if (isInstalled) return null;

  const handleClick = async () => {
    if (canInstall) {
      await promptInstall();
      return;
    }
    if (isIOS()) {
      toast('To install: tap the Share button, then "Add to Home Screen".', {
        duration: 6000, icon: '📲',
      });
      return;
    }
    toast('Open this site in Chrome on your phone to install the app.', { duration: 5000 });
  };

  // Show when the browser has offered install, or on iOS (to surface the hint).
  if (!canInstall && !isIOS()) return null;

  return (
    <button
      onClick={handleClick}
      className="text-brand-600 border border-brand-500 px-2.5 py-1 rounded-md text-xs font-medium hover:bg-brand-50"
    >
      📲 Install
    </button>
  );
}
