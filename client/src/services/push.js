// Web Push subscription helper (browser side).
// Free phone notifications for trip events. All calls are best-effort and
// degrade gracefully — if push is unsupported or denied, the app still works
// (Socket.io + in-app toasts remain the primary channel).

import { pushAPI } from './api';

// Push needs a service worker + PushManager + Notification support.
export function isPushSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

export function pushPermission() {
  return isPushSupported() ? Notification.permission : 'unsupported';
}

// VAPID public key comes as base64url; PushManager wants a Uint8Array.
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}

/**
 * Ask for permission (if needed), subscribe via the service worker, and send
 * the subscription to the backend.
 * @returns {Promise<{ ok: boolean, reason?: string }>}
 */
export async function subscribeToPush() {
  if (!isPushSupported()) return { ok: false, reason: 'unsupported' };

  // The SW is only registered in production builds.
  const reg = await navigator.serviceWorker.getRegistration();
  if (!reg) return { ok: false, reason: 'no-service-worker' };

  // Get the VAPID public key from the backend. Empty means push isn't
  // configured server-side (no VAPID env vars) — nothing to do.
  const { data } = await pushAPI.publicKey();
  if (!data.publicKey) return { ok: false, reason: 'not-configured' };

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return { ok: false, reason: permission };

  // Reuse an existing subscription if present, else create one.
  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(data.publicKey),
    });
  }

  const json = sub.toJSON(); // { endpoint, keys: { p256dh, auth } }
  await pushAPI.subscribe({ endpoint: json.endpoint, keys: json.keys });
  return { ok: true };
}

// Remove the local subscription and tell the backend to forget it.
export async function unsubscribeFromPush() {
  if (!isPushSupported()) return;
  const reg = await navigator.serviceWorker.getRegistration();
  const sub = reg && (await reg.pushManager.getSubscription());
  if (sub) {
    const { endpoint } = sub.toJSON();
    await sub.unsubscribe().catch(() => {});
    await pushAPI.unsubscribe(endpoint).catch(() => {});
  }
}
