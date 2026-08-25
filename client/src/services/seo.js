// Tiny SEO helper — sets document title + meta description without a library.
// Note: this is client-side (SPA). Google renders JS so it works for indexing,
// but for guaranteed crawlability you'd add SSR/prerender later. Good enough
// as a foundation; the sitemap + real content are what matter most early on.

import { useEffect } from 'react';

export function useSeo(title, description) {
  useEffect(() => {
    const prevTitle = document.title;
    if (title) document.title = title;

    let tag = document.querySelector('meta[name="description"]');
    const prevDesc = tag?.getAttribute('content');
    if (description) {
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', 'description');
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', description);
    }

    return () => {
      document.title = prevTitle;
      if (tag && prevDesc != null) tag.setAttribute('content', prevDesc);
    };
  }, [title, description]);
}
