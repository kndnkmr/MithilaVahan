// Logged-in account menu — an initial-circle avatar that opens a dropdown with
// the greeting, role-specific links, and a clearly styled Logout.
// Works on mobile too (so logged-in phone users have a real logout/account entry).

import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Links shown in the dropdown, by role.
const LINKS_BY_ROLE = {
  rider: [
    ['/book', 'Book a ride'],
    ['/trips', 'My trips'],
    ['/refer', 'Refer & earn'],
    ['/support', 'Support'],
  ],
  driver: [
    ['/driver', 'Dashboard'],
    ['/trips', 'My trips'],
    ['/refer', 'Refer & earn'],
    ['/support', 'Support'],
  ],
  admin: [['/admin', 'Admin panel']],
};

export default function AccountMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click / Escape.
  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  if (!user) return null;

  const name = user.name || 'User';
  const initial = name.trim().charAt(0).toUpperCase() || 'U';
  const links = LINKS_BY_ROLE[user.role] || [];

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate('/');
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 shrink-0"
        aria-label="Account menu"
      >
        <span className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 font-semibold flex items-center justify-center">
          {initial}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 card p-1.5 shadow-lg z-50">
          {/* Identity */}
          <div className="px-3 py-2 border-b mb-1">
            <div className="font-semibold text-gray-800 truncate">{name}</div>
            <div className="text-xs text-gray-400 capitalize">{user.role}</div>
          </div>

          {/* Role links */}
          {links.map(([to, label]) => (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            >
              {label}
            </Link>
          ))}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 mt-1 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
