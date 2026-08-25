import { useEffect, useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI, cityAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const HOME_BY_ROLE = { rider: '/book', driver: '/driver', admin: '/admin' };

export default function Register() {
  const [searchParams] = useSearchParams();
  const refFromUrl = searchParams.get('ref') || '';
  const [form, setForm] = useState({
    name: '', phone: '', email: '', password: '', role: 'rider', city: '',
    referralCode: refFromUrl,
  });
  const [cities, setCities] = useState([]);
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
        <div className="flex rounded-md border overflow-hidden">
          {['rider', 'driver'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setForm((f) => ({ ...f, role: r }))}
              className={`flex-1 py-2 text-sm capitalize ${
                form.role === r ? 'bg-brand-500 text-white' : 'bg-white text-gray-600'
              }`}
            >
              {r === 'rider' ? 'I want to ride' : 'I have a vehicle'}
            </button>
          ))}
        </div>

        <input
          value={form.name} onChange={set('name')} placeholder="Full name"
          className="w-full border rounded-md px-3 py-2" required
        />
        <input
          type="tel" inputMode="numeric" maxLength={10}
          value={form.phone} onChange={set('phone')} placeholder="10-digit mobile"
          className="w-full border rounded-md px-3 py-2" required
        />
        <input
          type="email" value={form.email} onChange={set('email')}
          placeholder="Email (optional)" className="w-full border rounded-md px-3 py-2"
        />
        <select value={form.city} onChange={set('city')} className="w-full border rounded-md px-3 py-2" required>
          <option value="">Select your city</option>
          {cities.map((c) => (
            <option key={c._id} value={c.name}>{c.name}</option>
          ))}
        </select>
        <input
          type="password" value={form.password} onChange={set('password')}
          placeholder="Password (min 6 chars)" className="w-full border rounded-md px-3 py-2" required
        />

        {/* Referral code (prefilled from a ?ref= link, editable) */}
        <input
          value={form.referralCode} onChange={set('referralCode')}
          placeholder="Referral code (optional)"
          className="w-full border rounded-md px-3 py-2 uppercase"
        />
        {refFromUrl && (
          <p className="text-xs text-green-600">🎉 You were invited with code {refFromUrl}</p>
        )}

        {form.role === 'driver' && (
          <p className="text-xs text-gray-500">
            Driver accounts need admin approval (license, RC, insurance) before you can accept trips.
          </p>
        )}

        <button
          disabled={loading}
          className="w-full bg-brand-500 text-white py-2.5 rounded-md hover:bg-brand-600 disabled:opacity-60"
        >
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
