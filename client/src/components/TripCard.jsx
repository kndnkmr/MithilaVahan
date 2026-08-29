// Displays a single trip; shows role-appropriate actions.

import { useState } from 'react';
import { driverAPI } from '../services/api';
import { navLink } from '../services/maps';
import { useLang, useT } from '../services/i18n';
import TripStatusGuide from './TripStatusGuide';

// Render ★ rating compactly.
function Stars({ value }) {
  const full = Math.round(value);
  return (
    <span className="text-amber-500" title={`${value} / 5`}>
      {'★'.repeat(full)}{'☆'.repeat(5 - full)}
    </span>
  );
}

const STATUS_STYLES = {
  requested: 'bg-yellow-100 text-yellow-700',
  accepted: 'bg-blue-100 text-blue-700',
  started: 'bg-indigo-100 text-indigo-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-200 text-gray-600',
};

// Build a wa.me click-to-chat link (free, no API).
function waLink(phone, text) {
  const digits = String(phone || '').replace(/\D/g, '').slice(-10);
  return `https://wa.me/91${digits}?text=${encodeURIComponent(text)}`;
}

// Compose an intuitive, role-aware WhatsApp opener so each side sends a message
// that makes sense for who they are and what they need — instead of one bland
// Compose an intuitive, role-aware WhatsApp opener — in the user's chosen
// language (English / हिंदी) so it's natural for the person sending it.
// Vehicle model / names / addresses are never translated (shown as typed).
function waMessage(trip, role, lang = 'en') {
  const senderName = (role === 'rider' ? trip.rider?.name : trip.driver?.name) || '';
  const vt = trip.vehicleType;
  const pickupAddr = trip.pickup?.address || '';

  if (lang === 'hi') {
    const iAm = senderName ? ` मैं ${senderName} हूँ।` : '';
    const where =
      trip.mode === 'outstation' && trip.destination
        ? ` ${trip.destination} के लिए`
        : trip.mode === 'hire'
        ? ' (पूरे दिन के लिए)'
        : '';
    const pickup = pickupAddr ? ` मेरा पिकअप: ${pickupAddr}।` : '';
    if (role === 'rider') {
      if (trip.status === 'accepted')
        return `नमस्ते, आपने मेरी MithilaVahan ${vt} यात्रा${where} स्वीकार की है।${iAm}${pickup} कृपया बताएँ कितनी देर में पहुँचेंगे।`;
      if (trip.status === 'started')
        return `नमस्ते, मेरी चल रही MithilaVahan ${vt} यात्रा${where} के बारे में।${iAm}`;
      return `नमस्ते, मेरी MithilaVahan ${vt} यात्रा${where} के बारे में।${iAm}${pickup}`;
    }
    // driver -> rider
    if (trip.status === 'accepted')
      return `नमस्ते, मैं आपकी MithilaVahan ${vt} यात्रा${where} का ड्राइवर हूँ।${iAm} मैं आपके पिकअप${pickupAddr ? ` (${pickupAddr})` : ''} की ओर आ रहा हूँ। कृपया अपनी सटीक जगह भेजें।`;
    if (trip.status === 'started')
      return `नमस्ते, मैं आपका MithilaVahan ड्राइवर हूँ।${iAm} आपकी यात्रा${where} शुरू हो गई है — मैं आपको अपडेट देता रहूँगा।`;
    return `नमस्ते, आपकी MithilaVahan ${vt} यात्रा${where} के बारे में।${iAm}`;
  }

  // --- English (default) ---
  const iAm = senderName ? ` This is ${senderName}.` : '';
  const where =
    trip.mode === 'outstation' && trip.destination
      ? ` to ${trip.destination}`
      : trip.mode === 'hire'
      ? ' (full-day hire)'
      : '';
  const pickup = pickupAddr ? ` My pickup is: ${pickupAddr}.` : '';

  if (role === 'rider') {
    if (trip.status === 'accepted')
      return `Hi, you accepted my MithilaVahan ${vt} trip${where}.${iAm}${pickup} Please let me know your ETA.`;
    if (trip.status === 'started')
      return `Hi, regarding my ongoing MithilaVahan ${vt} trip${where}.${iAm}`;
    return `Hi, about my MithilaVahan ${vt} trip${where}.${iAm}${pickup}`;
  }
  if (trip.status === 'accepted')
    return `Hi, I'm your MithilaVahan driver for the ${vt} trip${where}.${iAm} I'm heading to your pickup${pickupAddr ? ` at ${pickupAddr}` : ''}. Please share your exact location.`;
  if (trip.status === 'started')
    return `Hi, this is your MithilaVahan driver.${iAm} Your trip${where} is on the way — I'll keep you updated.`;
  return `Hi, regarding your MithilaVahan ${vt} trip${where}.${iAm}`;
}

export default function TripCard({ trip, role, onAction }) {
  const other = role === 'rider' ? trip.driver : trip.rider;
  const lang = useLang();
  const t = useT();
  // status label localized (statuses map to stRequested/stAccepted/... keys)
  const stKey = { requested: 'stRequested', accepted: 'stAccepted', started: 'stStarted', completed: 'stCompleted', cancelled: 'stCancelled' }[trip.status];
  const [reviews, setReviews] = useState(null);
  const [showReviews, setShowReviews] = useState(false);

  const toggleReviews = async () => {
    if (!showReviews && reviews === null && trip.driver?._id) {
      try {
        const res = await driverAPI.reviews(trip.driver._id);
        setReviews(res.data.reviews || []);
      } catch {
        setReviews([]);
      }
    }
    setShowReviews((s) => !s);
  };

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="font-medium capitalize">
          {trip.vehicleType} ·{' '}
          {trip.mode === 'hire'
            ? `${t('modeHire')} (${trip.days}d)`
            : trip.mode === 'outstation'
            ? t('modeOutstation')
            : t('modeTrip')}
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLES[trip.status]}`}>
          {stKey ? t(stKey) : trip.status}
        </span>
      </div>

      {/* Step-by-step guide for the current status + viewer role */}
      <TripStatusGuide status={trip.status} role={role} />

      <div className="text-sm text-gray-600 space-y-0.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span>{t('pickup')}: {trip.pickup?.address}</span>
          {navLink(trip.pickup || {}) && (
            <a href={navLink(trip.pickup)} target="_blank" rel="noreferrer"
              className="text-brand-600 font-medium text-xs whitespace-nowrap">🧭 {t('navigate')}</a>
          )}
        </div>
        {trip.mode === 'trip' && trip.drop?.address && (
          <div className="flex items-center gap-2 flex-wrap">
            <span>{t('drop')}: {trip.drop.address}</span>
            {navLink(trip.drop || {}) && (
              <a href={navLink(trip.drop)} target="_blank" rel="noreferrer"
                className="text-brand-600 font-medium text-xs whitespace-nowrap">🧭 {t('navigate')}</a>
            )}
          </div>
        )}
        {trip.mode === 'outstation' && (
          <>
            <div>
              {t('toLabel')}: <b>{trip.destination}</b>{' '}
              <span className="text-gray-400">
                ({trip.tripType === 'round-trip' ? t('roundTrip') : t('oneWay')})
              </span>
            </div>
            {trip.distanceKm > 0 && <div>{t('approxDistance')}: {trip.distanceKm} km</div>}
          </>
        )}
        <div>{t('city')}: {trip.city}</div>
        {(trip.mode === 'outstation' || trip.mode === 'hire') && trip.scheduledAt && (
          <div>{t('whenLabel')}: {new Date(trip.scheduledAt).toLocaleString('en-IN')}</div>
        )}
        {trip.estimatedFare > 0 && <div>{t('estimateLabel')}: ₹{trip.estimatedFare}</div>}
        {trip.status === 'completed' && trip.finalFare > 0 && (
          <div className="font-medium text-gray-800">{t('fareLabel')}: ₹{trip.finalFare}</div>
        )}
        {/* Platform fee only shown when a commission is actually in effect (> 0) */}
        {trip.status === 'completed' && trip.commissionPercent > 0 && (
          <div className="text-gray-500 text-xs">
            {t('platformFee')} ({trip.commissionPercent}%): ₹{trip.platformFee}
            {role === 'driver' && trip.finalFare > 0 && (
              <> · {t('youKeep')} ₹{trip.finalFare - trip.platformFee}</>
            )}
          </div>
        )}
      </div>

      {/* Payment (direct UPI) — shown once the trip is completed and paid by UPI */}
      {trip.status === 'completed' && trip.paymentMode === 'upi' && (
        <div className="mt-2 border-t pt-2 text-sm">
          {role === 'rider' && trip.paymentStatus !== 'paid' && (
            <div className="space-y-1">
              <div className="text-gray-600">
                ₹{trip.finalFare} — {t('payByUpi')}:
              </div>
              {trip.driver?.upiNumber && (
                <div className="font-medium">{t('upiNumberLabel')}: {trip.driver.upiNumber}</div>
              )}
              {trip.driver?.upiId && (
                <div className="font-medium">{t('upiIdLabel')}: {trip.driver.upiId}</div>
              )}
              {trip.driver?.qrImage && (
                <img src={trip.driver.qrImage} alt="Driver UPI QR"
                  className="w-32 h-32 object-contain border rounded-md" />
              )}
              {!trip.driver?.upiNumber && !trip.driver?.upiId && !trip.driver?.qrImage && (
                <div className="text-gray-400 text-xs">
                  {t('noUpiDetails')}
                </div>
              )}
            </div>
          )}
          <div className="mt-1">
            {trip.paymentStatus === 'pending' && role === 'rider' && (
              <button onClick={() => onAction?.('claim-paid', trip)}
                className="bg-brand-500 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-brand-600 transition">{t('ivePaid')}</button>
            )}
            {trip.paymentStatus === 'claimed' && role === 'rider' && (
              <span className="text-yellow-700 text-xs">{t('waitingConfirm')}</span>
            )}
            {trip.paymentStatus === 'claimed' && role === 'driver' && (
              <button onClick={() => onAction?.('confirm-payment', trip)}
                className="bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-green-700 transition">{t('paymentReceived')}</button>
            )}
            {trip.paymentStatus === 'pending' && role === 'driver' && (
              <span className="text-gray-400 text-xs">{t('awaitingPayment')}</span>
            )}
            {trip.paymentStatus === 'paid' && (
              <span className="text-green-700 text-xs">{t('paymentConfirmed')}</span>
            )}
          </div>
        </div>
      )}

      {/* The other party once assigned. For riders, a richer driver trust card. */}
      {other && (
        <div className="mt-2 text-sm border-t pt-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {/* Vehicle photo (rider view) */}
              {role === 'rider' && trip.vehicle?.photos?.[0] && (
                <img src={trip.vehicle.photos[0]} alt="" className="w-11 h-11 object-cover rounded-md border" />
              )}
              <div>
                <div>
                  {role === 'rider' ? t('driverLabel') : t('riderLabel')}: <b>{other.name}</b>
                </div>
                {role === 'rider' && (
                  <div className="text-xs text-gray-500">
                    {other.ratingCount > 0 ? (
                      <>
                        <Stars value={other.ratingAvg} /> {other.ratingAvg} ({other.ratingCount})
                      </>
                    ) : (
                      <span className="text-gray-400">{t('newDriver')}</span>
                    )}
                    {trip.vehicle?.model && <> · {trip.vehicle.model}</>}
                    {trip.vehicle?.registrationNumber && <> · {trip.vehicle.registrationNumber}</>}
                  </div>
                )}
              </div>
            </div>
            {other.phone && (
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <a
                  href={`tel:${other.phone}`}
                  className="inline-flex items-center gap-1 border border-brand-500 text-brand-600 font-medium rounded-full px-3 py-1 text-xs hover:bg-brand-50 transition whitespace-nowrap"
                  title={`${t('call')} ${role === 'rider' ? t('driverLabel') : t('riderLabel')}`}
                >
                  📞 {t('call')} {role === 'rider' ? t('driverLabel') : t('riderLabel')}
                </a>
                <a
                  href={waLink(other.phone, waMessage(trip, role, lang))}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 bg-green-600 text-white font-medium rounded-full px-3 py-1 text-xs hover:bg-green-700 transition whitespace-nowrap"
                  title={`${t('whatsapp')} ${role === 'rider' ? t('driverLabel') : t('riderLabel')}`}
                >
                  {t('whatsapp')} {role === 'rider' ? t('driverLabel') : t('riderLabel')}
                </a>
              </div>
            )}
          </div>

          {/* See reviews (rider view, when the driver has any rating history) */}
          {role === 'rider' && other.ratingCount > 0 && (
            <div className="mt-1">
              <button onClick={toggleReviews} className="text-brand-600 text-xs font-medium">
                {showReviews ? t('hideReviews') : t('seeReviews')}
              </button>
              {showReviews && (
                <div className="mt-1 space-y-1">
                  {reviews === null && <div className="text-xs text-gray-400">{t('loadingDots')}</div>}
                  {reviews?.length === 0 && <div className="text-xs text-gray-400">{t('noWrittenReviews')}</div>}
                  {reviews?.map((r, i) => (
                    <div key={i} className="text-xs bg-gray-50 rounded p-2">
                      <Stars value={r.rating} /> <span className="text-gray-600">{r.review}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Actions — consistent rounded-lg shape; semantic colors kept */}
      {onAction && (
        <div className="mt-3 flex flex-wrap gap-2">
          {role === 'driver' && trip.status === 'requested' && (
            <button onClick={() => onAction('accept', trip)}
              className="bg-brand-500 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-brand-600 transition">{t('accept')}</button>
          )}
          {role === 'driver' && trip.status === 'accepted' && (
            <button onClick={() => onAction('start', trip)}
              className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition">{t('startTrip')}</button>
          )}
          {role === 'driver' && trip.status === 'started' && (
            <button onClick={() => onAction('complete', trip)}
              className="bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-green-700 transition">{t('complete')}</button>
          )}
          {['requested', 'accepted'].includes(trip.status) && (
            <button onClick={() => onAction('cancel', trip)}
              className="border border-gray-300 text-gray-600 text-sm px-4 py-2 rounded-lg hover:border-red-300 hover:text-red-600 transition">{t('cancel')}</button>
          )}
          {role === 'rider' && trip.status === 'completed' && !trip.rating && (
            <button onClick={() => onAction('rate', trip)}
              className="border border-brand-500 text-brand-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-brand-50 transition">{t('rateDriver')}</button>
          )}
          {role === 'rider' && trip.rating && (
            <span className="text-sm text-gray-400">{t('youRated')} ★ {trip.rating}</span>
          )}
        </div>
      )}
    </div>
  );
}
