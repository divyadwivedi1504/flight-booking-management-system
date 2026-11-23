import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../api';

export default function Auth({ mode }) {
  const isLogin = mode === 'login';
  const { login, register } = useAuth();
  const nav = useNavigate();
  const { state } = useLocation();
  const [f, setF] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (isLogin) await login(f.email, f.password);
      else await register(f.name, f.email, f.password);
      nav(state?.from || '/', { replace: true });
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <form className="card auth" onSubmit={submit}>
        <div className="auth-icon">✈</div>
        <h1>{isLogin ? 'Welcome back' : 'Create your account'}</h1>
        <p className="muted">{isLogin ? 'Log in to manage your trips.' : 'Join SkyPort and start booking.'}</p>

        {!isLogin && <input placeholder="Full name" value={f.name} onChange={set('name')} required />}
        <input type="email" placeholder="Email" value={f.email} onChange={set('email')} required />
        <input type="password" placeholder="Password (min 6 chars)" value={f.password} onChange={set('password')} required />

        {error && <p className="alert">{error}</p>}
        <button className="btn lg" disabled={busy}>{busy ? 'Please wait…' : isLogin ? 'Log in' : 'Sign up'}</button>

        {isLogin && (
          <small className="muted">
            Demo: user@skyport.com / user123 &nbsp;·&nbsp; admin@skyport.com / admin123
          </small>
        )}
        <small>
          {isLogin ? 'New here? ' : 'Already registered? '}
          <Link className="link" to={isLogin ? '/register' : '/login'} state={state}>
            {isLogin ? 'Create account' : 'Log in'}
          </Link>
        </small>
      </form>
    </div>
  );
}
