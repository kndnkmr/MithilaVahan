// Mobile bottom navigation bar — modern app feel. Hidden on md+ screens.

import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function BottomNav() {
  const { user } = useAuth();
  const { pathname } = useLocation();

  // Tabs depend on role. Riders/guests get the booking-focused set.
  const isDriver = user?.role === 'driver';
  const isAdmin = user?.role === 'admin';

  // Don't clutter admin with rider tabs.
  const tabs = isAdmin
    ? [
        ['/', '🏠', 'Home'],
        ['/admin', '🛠️', 'Admin'],
      ]
    : isDriver
    ? [
        ['/', '🏠', 'Home'],
        ['/driver', '📋', 'Dashboard'],
        ['/trips', '🚗', 'Trips'],
        ['/refer', '🎁', 'Refer'],
      ]
    : [
        ['/', '🏠', 'Home'],
        ['/destinations', '🗺️', 'Explore'],
        ['/book', '➕', 'Book'],
        ['/trips', '🚗', 'Trips'],
      ];

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t flex justify-around">
      {tabs.map(([to, icon, label]) => {
        const active = pathname === to;
        return (
          <Link
            key={to}
            to={to}
            className={`flex-1 flex flex-col items-center py-2 text-[11px] ${
              active ? 'text-brand-600' : 'text-gray-500'
            }`}
          >
            <span className="text-lg leading-none">{icon}</span>
            <span className="mt-0.5">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
