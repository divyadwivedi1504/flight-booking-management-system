import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Flights from './pages/Flights';
import Book from './pages/Book';
import MyBookings from './pages/MyBookings';
import Auth from './pages/Auth';
import Admin from './pages/Admin';

function Protected({ children, admin }) {
  const { user } = useAuth();
  const loc = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: loc.pathname + loc.search }} replace />;
  if (admin && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <>
      <div className="bg-orbs" aria-hidden="true">
        <span /><span /><span />
      </div>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/flights" element={<Flights />} />
          <Route path="/book/:id" element={<Protected><Book /></Protected>} />
          <Route path="/bookings" element={<Protected><MyBookings /></Protected>} />
          <Route path="/admin" element={<Protected admin><Admin /></Protected>} />
          <Route path="/login" element={<Auth mode="login" />} />
          <Route path="/register" element={<Auth mode="register" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <footer className="footer">© {new Date().getFullYear()} SkyPort · Fly smarter ✈️</footer>
    </>
  );
}
