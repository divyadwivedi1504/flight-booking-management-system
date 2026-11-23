import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { errMsg } from '../api';
import SeatMap from '../components/SeatMap';
import { fmtTime, fmtDate, money, seatPrice } from '../utils';

export default function Book() {
  const { id } = useParams();
  const nav = useNavigate();
  const [flight, setFlight] = useState(null);
  const [selected, setSelected] = useState([]);
  const [pax, setPax] = useState({}); // { "12A": {name, age, gender} }
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => api.get(`/flights/${id}`).then((r) => setFlight(r.data)).catch((e) => setError(errMsg(e)));
  useEffect(() => { load(); }, [id]);

  const toggle = (seat) => {
    setError('');
    setSelected((s) => {
      if (s.includes(seat)) return s.filter((x) => x !== seat);
      if (s.length >= 6) { setError('You can book up to 6 seats at once'); return s; }
      return [...s, seat];
    });
  };

  const setP = (seat, k, v) =>
    setPax((p) => ({ ...p, [seat]: { gender: 'Male', ...p[seat], [k]: v } }));

  const total = flight ? selected.reduce((sum, s) => sum + seatPrice(flight.price, s), 0) : 0;

  const confirm = async () => {
    setError('');
    if (selected.length === 0) return setError('Select at least one seat');
    const passengers = selected.map((seat) => ({ seat, gender: 'Male', ...pax[seat] }));
    if (passengers.some((p) => !p.name?.trim() || !p.age))
      return setError('Please fill name and age for every passenger');
    setBusy(true);
    try {
      const { data } = await api.post('/bookings', { flightId: id, passengers });
      nav('/bookings', { state: { pnr: data.pnr } });
    } catch (e) {
      setError(errMsg(e));
      load(); // refresh seat map in case someone else booked
      setSelected([]);
    } finally {
      setBusy(false);
    }
  };

  if (!flight) return <div className="page"><div className="card skeleton" />{error && <p className="alert">{error}</p>}</div>;

  return (
    <div className="page">
      <div className="page-head">
        <h1>{flight.fromCity} <span className="grad">→</span> {flight.toCity}</h1>
        <p>
          {flight.airline} {flight.flightNumber} · {fmtDate(flight.departure)} · {fmtTime(flight.departure)} –{' '}
          {fmtTime(flight.arrival)}
        </p>
      </div>

      <div className="layout-book">
        <div className="card">
          <h3>1. Choose your seats</h3>
          <SeatMap booked={flight.bookedSeats} selected={selected} onToggle={toggle} />
        </div>

        <div className="stack">
          <div className="card">
            <h3>2. Passenger details</h3>
            {selected.length === 0 && <p className="muted">Tap a seat on the map to begin.</p>}
            {selected.map((seat, i) => (
              <div className="pax-form" key={seat}>
                <div className="pax-title">
                  <span className="seat-tag">{seat}</span> Passenger {i + 1}
                  <small>{parseInt(seat) <= 4 ? 'Business' : 'Economy'} · {money(seatPrice(flight.price, seat))}</small>
                </div>
                <input placeholder="Full name" value={pax[seat]?.name || ''} onChange={(e) => setP(seat, 'name', e.target.value)} />
                <div className="two">
                  <input type="number" min="0" max="120" placeholder="Age" value={pax[seat]?.age || ''} onChange={(e) => setP(seat, 'age', e.target.value)} />
                  <select value={pax[seat]?.gender || 'Male'} onChange={(e) => setP(seat, 'gender', e.target.value)}>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
              </div>
            ))}
          </div>

          <div className="card summary">
            <h3>3. Summary</h3>
            <div className="line"><span>Seats</span><b>{selected.join(', ') || '—'}</b></div>
            <div className="line"><span>Passengers</span><b>{selected.length}</b></div>
            <div className="line total"><span>Total</span><b>{money(total)}</b></div>
            {error && <p className="alert">{error}</p>}
            <button className="btn lg" disabled={busy || selected.length === 0} onClick={confirm}>
              {busy ? 'Booking…' : 'Confirm & pay (demo)'}
            </button>
            <small className="muted">No real payment is taken — this is a demo.</small>
          </div>
        </div>
      </div>
    </div>
  );
}
