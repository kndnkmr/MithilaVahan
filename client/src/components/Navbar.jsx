import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import InstallButton from './InstallButton';
import AccountMenu from './AccountMenu';
import Logo from './Logo';
import { useT, useLang, setLang } from '../services/i18n';

export default function Navbar() {
  const { user } = useAuth();
  const t = useT();
  const lang = useLang();

  return (
    <header className="bg-white border-b sticky top-0 z-40">
      <nav className="max-w-6xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between gap-2">
        <Link to="/" className="shrink-0" aria-label="MithilaVahan home">
          <Logo size={30} />
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
          <Link to="/vehicles" className="text-gray-600 hover:text-brand-600 hidden md:inline">{t('vehicles')}</Link>
          <Link to="/destinations" className="text-gray-600 hover:text-brand-600 hidden md:inline">{t('explore')}</Link>
          <Link to="/blog" className="text-gray-600 hover:text-brand-600 hidden md:inline">{t('blog')}</Link>
          <Link to="/install" className="text-gray-600 hover:text-brand-600 hidden md:inline">📲 {t('getApp')}</Link>
          <span className="hidden md:inline"><InstallButton /></span>

          {!user && (
            <>
              <Link
                to="/login"
                className="border border-brand-500 text-brand-600 px-3.5 py-1.5 rounded-lg font-medium hover:bg-brand-50 shrink-0 whitespace-nowrap transition"
              >
                {t('login')}
              </Link>
              <Link
                to="/register"
                className="bg-brand-500 text-white px-3.5 py-1.5 rounded-lg font-medium shadow-sm hover:bg-brand-600 active:scale-[0.98] shrink-0 whitespace-nowrap transition"
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

          {user && <AccountMenu />}
        </div>
      </nav>
    </header>
  );
}
