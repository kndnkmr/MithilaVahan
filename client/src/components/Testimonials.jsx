// Testimonials — shows recent REAL 4–5★ reviews from completed trips.
// Renders nothing if there are none yet (honest: no fake reviews). Used on the
// Home and Services pages for trust.

import { useEffect, useState } from 'react';
import { tripAPI } from '../services/api';
import { useLang } from '../services/i18n';

function Stars({ n }) {
  return <span className="text-amber-500 text-sm">{'★'.repeat(n)}{'☆'.repeat(5 - n)}</span>;
}

export default function Testimonials({ limit = 6 }) {
  const lang = useLang();
  const [reviews, setReviews] = useState(null); // null = loading

  useEffect(() => {
    tripAPI.reviews()
      .then((r) => setReviews(r.data.reviews || []))
      .catch(() => setReviews([]));
  }, []);

  // While loading or when there are genuinely no reviews yet, render nothing —
  // better an honest absence than filler.
  if (!reviews || reviews.length === 0) return null;

  const shown = reviews.slice(0, limit);
  const heading = lang === 'hi' ? 'हमारे यात्री क्या कहते हैं' : 'What our riders say';

  return (
    <section className="bg-white border-y">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-8 text-center">{heading}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {shown.map((r, i) => (
            <div key={i} className="card p-5">
              <Stars n={r.rating} />
              <p className="text-gray-700 text-sm mt-2 mb-3">“{r.review}”</p>
              <div className="text-xs text-gray-500">
                <span className="font-medium text-gray-700">{r.name}</span>
                {r.route ? ` · ${r.route}` : ''}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
