import { useEffect, useState } from 'react';
import api, { errMsg } from '../api';
import { fmtDate, fmtTime, money } from '../utils';
import { statusClass } from '../components/FlightCard';

const blank = {
  airline: '', flightNumber: '', fromCode: '', fromCity: '', toCode: '', toCity: '',
  departure: '', arrival: '', price: '', gate: '', terminal: 'T1',
};

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [flights, setFlights] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState(blank);
  const [msg, setMsg] = useState('');

  const load = async () => {
    const [s, f, b] = await Promise.all([
      api.get('/bookings/admin/stats'),
      api.get('/flights'),
      api.get('/bookings/admin/all'),
    ]);
    setStats(s.data);
    setFlights(f.data);
    setBookings(b.data);
  };
  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const add = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      await api.post('/flights', { ...form, price: Number(form.price) });
      setForm(blank);
      setMsg('✅ Flight added');
      load();
    } catch (err) {
      setMsg(errMsg(err));
    }
  };

  const del = async (f) => {
    if (!window.confirm(`Delete ${f.flightNumber}?`)) return;
    await api.delete(`/flights/${f._id}`);
    load();
  };

  const status = async (f, s) => {
    await api.patch(`/flights/${f._id}/status`, { status: s });
    load();
  };

  const cards = stats && [
    ['💰', 'Revenue', money(stats.revenue)],
    ['🎫', 'Confirmed bookings', stats.bookings],
    ['🛫', 'Flights', stats.flights],
    ['👥', 'Travelers', stats.users],
  ];

  return (
    <div className="page">
      <div className="page-head">
        <h1>Admin <span className="grad">control tower</span></h1>
        <p>Manage flights, statuses and bookings.</p>
      </div>

      <div className="grid-4">
        {cards?.map(([i, l, v]) => (
          <div className="card stat" key={l}>
            <span className="emoji">{i}</span>
            <b>{v}</b>
            <small>{l}</small>
          </div>
        ))}
      </div>

      <div className="card section-card">
        <h3>Add a flight</h3>
        <form className="admin-form" onSubmit={add}>
          <input placeholder="Airline" value={form.airline} onChange={set('airline')} required />
          <input placeholder="Flight no. (SJ101)" value={form.flightNumber} onChange={set('flightNumber')} required />
          <input placeholder="From code (IDR)" maxLength={3} value={form.fromCode} onChange={set('fromCode')} required />
          <input placeholder="From city" value={form.fromCity} onChange={set('fromCity')} required />
          <input placeholder="To code (DEL)" maxLength={3} value={form.toCode} onChange={set('toCode')} required />
          <input placeholder="To city" value={form.toCity} onChange={set('toCity')} required />
          <label><span>Departure</span><input type="datetime-local" value={form.departure} onChange={set('departure')} required /></label>
          <label><span>Arrival</span><input type="datetime-local" value={form.arrival} onChange={set('arrival')} required /></label>
          <input type="number" placeholder="Base price ₹" value={form.price} onChange={set('price')} required />
          <input placeholder="Gate (A4)" value={form.gate} onChange={set('gate')} />
          <input placeholder="Terminal (T1)" value={form.terminal} onChange={set('terminal')} />
          <button className="btn">Add flight</button>
        </form>
        {msg && <p className="alert">{msg}</p>}
      </div>

      <div className="card section-card">
        <h3>Flights ({flights.length})</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Flight</th><th>Route</th><th>Departs</th><th>Price</th><th>Booked</th><th>Status</th><th /></tr>
            </thead>
            <tbody>
              {flights.slice(0, 40).map((f) => (
                <tr key={f._id}>
                  <td>{f.flightNumber}<br /><small>{f.airline}</small></td>
                  <td>{f.fromCode} → {f.toCode}</td>
                  <td>{fmtDate(f.departure)} {fmtTime(f.departure)}</td>
                  <td>{money(f.price)}</td>
                  <td>{f.bookedSeats.length}/120</td>
                  <td>
                    <select className={`pill ${statusClass(f.status)}`} value={f.status} onChange={(e) => status(f, e.target.value)}>
                      {['On Time', 'Delayed', 'Boarding', 'Cancelled'].map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td><button className="btn danger sm" onClick={() => del(f)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card section-card">
        <h3>Recent bookings</h3>
        <div className="table-wrap">
          <table>
            <thead><tr><th>PNR</th><th>Traveler</th><th>Flight</th><th>Seats</th><th>Total</th><th>Status</th></tr></thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id}>
                  <td className="mono">{b.pnr}</td>
                  <td>{b.user?.name}<br /><small>{b.user?.email}</small></td>
                  <td>{b.flight?.flightNumber} · {b.flight?.fromCode}→{b.flight?.toCode}</td>
                  <td>{b.passengers.map((p) => p.seat).join(', ')}</td>
                  <td>{money(b.totalPrice)}</td>
                  <td><span className={`pill ${b.status === 'Confirmed' ? 'ok' : 'bad'}`}>{b.status}</span></td>
                </tr>
              ))}
              {bookings.length === 0 && <tr><td colSpan="6" className="empty">No bookings yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
