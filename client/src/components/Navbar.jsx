import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import InstallButton from './InstallButton';
import { useT, useLang, setLang } from '../services/i18n';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const t = useT();
  const lang = useLang();

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
          {/* Language toggle */}
          <button
            onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
            className="text-gray-600 hover:text-brand-600 border rounded-full px-2.5 py-0.5 text-xs"
            title="Switch language"
          >
            {lang === 'en' ? 'हिंदी' : 'EN'}
          </button>

          <Link to="/destinations" className="text-gray-600 hover:text-brand-600 hidden sm:inline">{t('explore')}</Link>
          <Link to="/blog" className="text-gray-600 hover:text-brand-600 hidden md:inline">{t('blog')}</Link>
          <Link to="/install" className="text-gray-600 hover:text-brand-600 hidden sm:inline">📲 {t('getApp')}</Link>
          <InstallButton />
          {!user && (
            <>
              <Link to="/login" className="text-gray-600 hover:text-brand-600">
                {t('login')}
              </Link>
              <Link
                to="/register"
                className="bg-brand-500 text-white px-3 py-1.5 rounded-md hover:bg-brand-600"
              >
                {t('register')}
              </Link>
            </>
          )}

          {user?.role === 'rider' && (
            <>
              <Link to="/book" className="text-gray-600 hover:text-brand-600">{t('book')}</Link>
              <Link to="/trips" className="text-gray-600 hover:text-brand-600">{t('myTrips')}</Link>
              <Link to="/refer" className="text-gray-600 hover:text-brand-600 hidden sm:inline">{t('refer')}</Link>
            </>
          )}
          {user?.role === 'driver' && (
            <>
              <Link to="/driver" className="text-gray-600 hover:text-brand-600">Dashboard</Link>
              <Link to="/trips" className="text-gray-600 hover:text-brand-600">{t('myTrips')}</Link>
              <Link to="/refer" className="text-gray-600 hover:text-brand-600 hidden sm:inline">{t('refer')}</Link>
            </>
          )}
          {user?.role === 'admin' && (
            <Link to="/admin" className="text-gray-600 hover:text-brand-600">Admin</Link>
          )}

          {user && (
            <>
              <span className="text-gray-400 hidden sm:inline">Hi, {user.name.split(' ')[0]}</span>
              <button onClick={handleLogout} className="text-gray-600 hover:text-red-600">
                {t('logout')}
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
