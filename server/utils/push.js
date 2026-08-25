// Web Push sender (VAPID). No-op if keys aren't configured, so the app
// works fine without push (falls back to Socket.io + polling).

const webpush = require('web-push');
const PushSubscription = require('../models/PushSubscription');

let enabled = false;

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:support@mithilavahan.in',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
  enabled = true;
}

// Send a push notification to all of a user's subscribed devices.
async function sendPushToUser(userId, payload) {
  if (!enabled) return;
  const subs = await PushSubscription.find({ user: userId });
  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          JSON.stringify(payload)
        );
      } catch (err) {
        // Clean up stale/expired subscriptions
        if (err.statusCode === 404 || err.statusCode === 410) {
          await PushSubscription.deleteOne({ _id: sub._id });
        }
      }
    })
  );
}

module.exports = { sendPushToUser, isPushEnabled: () => enabled };
