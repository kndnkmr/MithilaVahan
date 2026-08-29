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
      <nav className="max-w-6xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between gap-2">
        <Link to="/" className="font-bold text-base sm:text-lg text-brand-600 shrink-0">
          MithilaVahan
        </Link>

        <div className="flex items-center gap-2 sm:gap-4 text-sm min-w-0">
          {/* Language toggle */}
          <button
            onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
            className="text-gray-600 hover:text-brand-600 border rounded-full px-2 py-0.5 text-xs shrink-0"
            title="Switch language"
          >
            {lang === 'en' ? 'हिंदी' : 'EN'}
          </button>

          {/* Secondary links — desktop/tablet only (mobile uses the bottom nav) */}
          <Link to="/destinations" className="text-gray-600 hover:text-brand-600 hidden md:inline">{t('explore')}</Link>
          <Link to="/blog" className="text-gray-600 hover:text-brand-600 hidden md:inline">{t('blog')}</Link>
          <Link to="/install" className="text-gray-600 hover:text-brand-600 hidden md:inline">📲 {t('getApp')}</Link>
          <span className="hidden md:inline"><InstallButton /></span>

          {!user && (
            <>
              <Link to="/login" className="text-gray-600 hover:text-brand-600 shrink-0 whitespace-nowrap">
                {t('login')}
              </Link>
              <Link
                to="/register"
                className="bg-brand-500 text-white px-3 py-1.5 rounded-md hover:bg-brand-600 shrink-0 whitespace-nowrap"
              >
                {t('register')}
              </Link>
            </>
          )}

          {user?.role === 'rider' && (
            <>
              <Link to="/book" className="text-gray-600 hover:text-brand-600 hidden md:inline">{t('book')}</Link>
              <Link to="/trips" className="text-gray-600 hover:text-brand-600 hidden md:inline">{t('myTrips')}</Link>
              <Link to="/refer" className="text-gray-600 hover:text-brand-600 hidden md:inline">{t('refer')}</Link>
            </>
          )}
          {user?.role === 'driver' && (
            <>
              <Link to="/driver" className="text-gray-600 hover:text-brand-600 hidden md:inline">Dashboard</Link>
              <Link to="/trips" className="text-gray-600 hover:text-brand-600 hidden md:inline">{t('myTrips')}</Link>
              <Link to="/refer" className="text-gray-600 hover:text-brand-600 hidden md:inline">{t('refer')}</Link>
            </>
          )}
          {user?.role === 'admin' && (
            <Link to="/admin" className="text-gray-600 hover:text-brand-600 shrink-0">Admin</Link>
          )}

          {user && (
            <>
              <span className="text-gray-400 hidden lg:inline shrink-0">Hi, {user.name.split(' ')[0]}</span>
              <button onClick={handleLogout} className="text-gray-600 hover:text-red-600 shrink-0 whitespace-nowrap">
                {t('logout')}
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
