import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { errMsg } from '../lib/api';
import { useAuth } from '../context/AuthContext';

function AuthForm({ mode }) {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const isLogin = mode === 'login';
  const bind = (k) => ({ value: form[k], onChange: (e) => setForm({ ...form, [k]: e.target.value }) });

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      isLogin ? await login(form.email, form.password) : await register(form);
      navigate(state?.from || '/', { replace: true });
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <h1 className="text-3xl">{isLogin ? 'Log in' : 'Create your account'}</h1>
      <form onSubmit={submit} className="card mt-6 space-y-4 p-6">
        {!isLogin && (<div><label className="label" htmlFor="name">Full name</label><input id="name" className="input" required {...bind('name')} /></div>)}
        <div><label className="label" htmlFor="email">Email</label><input id="email" type="email" className="input" required autoComplete="email" {...bind('email')} /></div>
        {!isLogin && (<div><label className="label" htmlFor="phone">Phone (optional)</label><input id="phone" className="input" {...bind('phone')} /></div>)}
        <div><label className="label" htmlFor="password">Password</label><input id="password" type="password" minLength={6} className="input" required autoComplete={isLogin ? 'current-password' : 'new-password'} {...bind('password')} />{!isLogin && <p className="mt-1 text-xs text-ink/50">At least 6 characters.</p>}</div>
        {error && <p role="alert" className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <button className="btn-primary w-full py-3" disabled={busy}>{busy ? 'Please wait…' : isLogin ? 'Log in' : 'Create account'}</button>
      </form>
      <p className="mt-4 text-center text-sm text-ink/70">
        {isLogin ? <>New here? <Link className="text-garnet underline" to="/register" state={state}>Create an account</Link></> : <>Already registered? <Link className="text-garnet underline" to="/login" state={state}>Log in</Link></>}
      </p>
    </div>
  );
}

export const Login = () => <AuthForm mode="login" />;
export const Register = () => <AuthForm mode="register" />;
