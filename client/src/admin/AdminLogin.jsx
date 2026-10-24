import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { errMsg } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function AdminLogin() {
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role !== 'admin') {
        logout();
        setError('This account does not have admin access.');
      } else navigate('/admin', { replace: true });
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-night px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-lg bg-white p-7 shadow-xl">
        <h1 className="text-2xl text-garnet">Admin sign in</h1>
        <p className="mt-1 text-sm text-ink/60">Manage products, rates, orders and the storefront.</p>
        <div className="mt-5"><label className="label" htmlFor="ae">Email</label><input id="ae" type="email" required className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
        <div className="mt-4"><label className="label" htmlFor="ap">Password</label><input id="ap" type="password" required className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
        {error && <p role="alert" className="mt-4 rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <button className="btn-primary mt-5 w-full py-3" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        <Link to="/" className="mt-4 block text-center text-sm text-ink/60 hover:text-garnet">Back to the store</Link>
      </form>
    </div>
  );
}
