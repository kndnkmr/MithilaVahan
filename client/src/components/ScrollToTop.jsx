// Resets scroll to the top whenever the route (pathname) changes.
// SPA navigations don't reset scroll natively, so without this a page opened
// from a link lower down would appear scrolled partway.

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
