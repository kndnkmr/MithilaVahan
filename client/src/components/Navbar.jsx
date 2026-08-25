import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white border-b sticky top-0 z-40">
      <nav className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="font-bold text-lg text-brand-600">
          MithilaVahan
        </Link>

        <div className="flex items-center gap-4 text-sm">
          {!user && (
            <>
              <Link to="/login" className="text-gray-600 hover:text-brand-600">
                Login
              </Link>
              <Link
                to="/register"
                className="bg-brand-500 text-white px-3 py-1.5 rounded-md hover:bg-brand-600"
              >
                Register
              </Link>
            </>
          )}

          {user?.role === 'rider' && (
            <>
              <Link to="/book" className="text-gray-600 hover:text-brand-600">Book</Link>
              <Link to="/trips" className="text-gray-600 hover:text-brand-600">My Trips</Link>
            </>
          )}
          {user?.role === 'driver' && (
            <>
              <Link to="/driver" className="text-gray-600 hover:text-brand-600">Dashboard</Link>
              <Link to="/trips" className="text-gray-600 hover:text-brand-600">My Trips</Link>
            </>
          )}
          {user?.role === 'admin' && (
            <Link to="/admin" className="text-gray-600 hover:text-brand-600">Admin</Link>
          )}

          {user && (
            <>
              <span className="text-gray-400 hidden sm:inline">Hi, {user.name.split(' ')[0]}</span>
              <button onClick={handleLogout} className="text-gray-600 hover:text-red-600">
                Logout
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
