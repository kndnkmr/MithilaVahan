// "Get the App" + Share page. Free — install as PWA + share via WhatsApp/social.

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

function isStandalone() {
  return window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true;
}
function isIOS() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent) && !window.MSStream;
}

const SITE = typeof window !== 'undefined' ? window.location.origin : 'https://mithila-vahan.vercel.app';
const SHARE_TEXT =
  'Book cars, autos, tempos, buses & trucks with a driver in Darbhanga & Muzaffarpur — MithilaVahan.';

export default function InstallApp() {
  const [deferred, setDeferred] = useState(null);
  const [installed, setInstalled] = useState(isStandalone());

  useEffect(() => {
    const onPrompt = (e) => {
      e.preventDefault();
      setDeferred(e);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const install = async () => {
    if (deferred) {
      deferred.prompt();
      await deferred.userChoice;
      setDeferred(null);
    } else if (isIOS()) {
      toast('On iPhone: tap the Share button, then "Add to Home Screen".', { duration: 6000, icon: '📲' });
    } else {
      toast('Open this site in Chrome on your phone, then tap Install.', { duration: 5000 });
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(SITE);
      toast.success('Link copied');
    } catch {
      toast.error('Could not copy');
    }
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'MithilaVahan', text: SHARE_TEXT, url: SITE });
      } catch { /* user cancelled */ }
    } else {
      copyLink();
    }
  };

  const enc = encodeURIComponent(`${SHARE_TEXT} ${SITE}`);
  const shareLinks = [
    ['WhatsApp', `https://wa.me/?text=${enc}`, 'bg-green-500'],
    ['Facebook', `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SITE)}`, 'bg-blue-600'],
    ['Telegram', `https://t.me/share/url?url=${encodeURIComponent(SITE)}&text=${encodeURIComponent(SHARE_TEXT)}`, 'bg-sky-500'],
    ['X', `https://twitter.com/intent/tweet?text=${enc}`, 'bg-black'],
  ];

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-2">Get the MithilaVahan app</h1>
      <p className="text-gray-600 mb-6">
        Install it on your phone for one-tap booking, live tracking and trip alerts.
      </p>

      {/* Install */}
      <div className="bg-white border rounded-xl p-5 mb-6">
        {installed ? (
          <div className="text-green-700 font-medium">✓ App is installed on this device.</div>
        ) : (
          <>
            <button onClick={install} className="bg-brand-500 text-white px-6 py-3 rounded-lg font-semibold w-full sm:w-auto">
              📲 Install app
            </button>
            <div className="mt-4 text-sm text-gray-600 space-y-2">
              <div><b>Android / Chrome:</b> tap "Install app" above (or the ⋮ menu → "Install app").</div>
              <div><b>iPhone / Safari:</b> tap the Share icon <span className="font-mono">⬆️</span>, then "Add to Home Screen".</div>
            </div>
          </>
        )}
      </div>

      {/* Share */}
      <div className="bg-white border rounded-xl p-5">
        <h2 className="font-semibold mb-3">Share MithilaVahan</h2>
        <div className="flex flex-wrap gap-2 mb-3">
          {shareLinks.map(([label, url, color]) => (
            <a key={label} href={url} target="_blank" rel="noreferrer"
              className={`${color} text-white px-4 py-2 rounded-md text-sm`}>
              {label}
            </a>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={nativeShare} className="border px-4 py-2 rounded-md text-sm">More…</button>
          <button onClick={copyLink} className="border px-4 py-2 rounded-md text-sm">Copy link</button>
        </div>
        <p className="text-xs text-gray-400 mt-3 break-all">{SITE}</p>
      </div>
    </div>
  );
}
