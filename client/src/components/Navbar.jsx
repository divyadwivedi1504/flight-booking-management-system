import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  return (
    <header className="nav">
      <Link to="/" className="brand">
        <span className="brand-icon">✈</span> Sky<b>Port</b>
      </Link>
      <nav className="nav-links">
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/flights">Flights</NavLink>
        {user && <NavLink to="/bookings">My Trips</NavLink>}
        {user?.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}
      </nav>
      <div className="nav-actions">
        {user ? (
          <>
            <span className="hello">Hi, {user.name.split(' ')[0]}</span>
            <button className="btn ghost sm" onClick={() => { logout(); nav('/'); }}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn ghost sm">Login</Link>
            <Link to="/register" className="btn sm">Sign up</Link>
          </>
        )}
      </div>
    </header>
  );
}
