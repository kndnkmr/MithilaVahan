import { useEffect, useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI, cityAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import PasswordToggleIcon from '../components/PasswordToggleIcon';

const HOME_BY_ROLE = { rider: '/book', driver: '/driver', admin: '/admin' };

export default function Register() {
  const [searchParams] = useSearchParams();
  const refFromUrl = searchParams.get('ref') || '';
  const [form, setForm] = useState({
    name: '', phone: '', email: '', password: '', role: 'rider', city: '',
    referralCode: refFromUrl,
  });
  const [cities, setCities] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    cityAPI.list().then((res) => setCities(res.data.cities)).catch(() => {});
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.register(form);
      login(res.data.token, res.data.user);
      toast.success('Account created!');
      navigate(HOME_BY_ROLE[res.data.user.role] || '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">Create account</h1>

      <form onSubmit={submit} className="space-y-4">
        {/* Role toggle */}
        <div className="flex rounded-lg border overflow-hidden">
          {['rider', 'driver'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setForm((f) => ({ ...f, role: r }))}
              className={`flex-1 py-2.5 text-sm capitalize transition ${
                form.role === r ? 'bg-brand-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {r === 'rider' ? 'I want to ride' : 'I have a vehicle'}
            </button>
          ))}
        </div>

        <input value={form.name} onChange={set('name')} placeholder="Full name" className="input" required />
        <input
          type="tel" inputMode="numeric" maxLength={10}
          value={form.phone} onChange={set('phone')} placeholder="10-digit mobile" className="input" required
        />
        <input
          type="email" value={form.email} onChange={set('email')}
          placeholder="Email (optional)" className="input"
        />
        <select value={form.city} onChange={set('city')} className="input" required>
          <option value="">Select your city</option>
          {cities.map((c) => (
            <option key={c._id} value={c.name}>{c.name}</option>
          ))}
        </select>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'} value={form.password} onChange={set('password')}
            placeholder="Password (min 6 chars)" className="input pr-11" required
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

        {/* Referral code (prefilled from a ?ref= link, editable) */}
        <input
          value={form.referralCode} onChange={set('referralCode')}
          placeholder="Referral code (optional)"
          className="input uppercase"
        />
        {refFromUrl && (
          <p className="text-xs text-green-600">🎉 You were invited with code {refFromUrl}</p>
        )}

        {form.role === 'driver' && (
          <p className="text-xs text-gray-500">
            Driver accounts need admin approval (license, RC, insurance) before you can accept trips.
          </p>
        )}

        <button disabled={loading} className="btn-primary w-full">
          {loading ? 'Creating…' : 'Create account'}
        </button>
      </form>

      <p className="text-sm text-gray-500 mt-4 text-center">
        Already have an account?{' '}
        <Link to="/login" className="text-brand-600 font-medium">Login</Link>
      </p>
    </div>
  );
}
