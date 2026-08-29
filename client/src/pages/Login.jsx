import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useT } from '../services/i18n';
import PasswordToggleIcon from '../components/PasswordToggleIcon';

// Where each role lands after login.
const HOME_BY_ROLE = { rider: '/book', driver: '/driver', admin: '/admin' };

export default function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const t = useT();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.login({ phone, password });
      login(res.data.token, res.data.user);
      toast.success('Welcome back!');
      navigate(HOME_BY_ROLE[res.data.user.role] || '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-1">{t('welcomeBack')}</h1>
      <p className="text-gray-500 text-sm mb-6">{t('login')}.</p>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">{t('phone')}</label>
          <input
            type="tel"
            inputMode="numeric"
            maxLength={10}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="10-digit mobile"
            className="input"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t('password')}</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input pr-11"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              <PasswordToggleIcon visible={showPassword} />
            </button>
          </div>
        </div>
        <button disabled={loading} className="btn-primary w-full">
          {loading ? t('loggingIn') : t('login')}
        </button>
      </form>

      <p className="text-sm text-gray-500 mt-4 text-center">
        {t('noAccount')}{' '}
        <Link to="/register" className="text-brand-600 font-medium">
          {t('createAccount')}
        </Link>
      </p>
    </div>
  );
}
