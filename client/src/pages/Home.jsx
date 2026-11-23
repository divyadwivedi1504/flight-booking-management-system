import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { fmtTime, todayISO } from '../utils';
import { statusClass } from '../components/FlightCard';

const POPULAR = [
  { from: 'Indore', to: 'Delhi', emoji: '🏛️', price: '₹4,200' },
  { from: 'Mumbai', to: 'Goa', emoji: '🏖️', price: '₹2,900' },
  { from: 'Delhi', to: 'Dubai', emoji: '🌆', price: '₹14,500' },
  { from: 'Bengaluru', to: 'Hyderabad', emoji: '🌳', price: '₹2,800' },
];

const FEATURES = [
  ['🪑', 'Pick your exact seat', 'Interactive cabin map with live availability.'],
  ['⚡', 'Instant PNR', 'Get a confirmed boarding pass in seconds.'],
  ['💸', '90% easy refunds', 'Cancel anytime before departure.'],
  ['📡', 'Live departure board', 'Gate, terminal and status updates.'],
];

export default function Home() {
  const nav = useNavigate();
  const [form, setForm] = useState({ from: '', to: '', date: todayISO() });
  const [board, setBoard] = useState([]);

  useEffect(() => {
    api.get('/flights').then((r) => setBoard(r.data.slice(0, 7))).catch(() => {});
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const swap = () => setForm({ ...form, from: form.to, to: form.from });
  const search = (e) => {
    e.preventDefault();
    const p = new URLSearchParams();
    Object.entries(form).forEach(([k, v]) => v && p.set(k, v));
    nav(`/flights?${p.toString()}`);
  };

  return (
    <>
      <section className="hero">
        <div className="hero-plane">✈</div>
        <h1>
          Your next <span className="grad">adventure</span>
          <br />starts at SkyPort.
        </h1>
        <p>Search, compare and book flights across India and beyond — with real seat selection.</p>

        <form className="search card" onSubmit={search}>
          <label>
            <span>From</span>
            <input placeholder="City or code (IDR)" value={form.from} onChange={set('from')} />
          </label>
          <button type="button" className="swap" onClick={swap} title="Swap">⇄</button>
          <label>
            <span>To</span>
            <input placeholder="City or code (DEL)" value={form.to} onChange={set('to')} />
          </label>
          <label>
            <span>Date</span>
            <input type="date" min={todayISO()} value={form.date} onChange={set('date')} />
          </label>
          <button className="btn lg" type="submit">Search flights</button>
        </form>
      </section>

      <section className="section">
        <h2 className="section-title">Popular routes</h2>
        <div className="grid-4">
          {POPULAR.map((p) => (
            <button
              key={p.to}
              className="card route-card"
              onClick={() => nav(`/flights?from=${p.from}&to=${p.to}`)}
            >
              <span className="emoji">{p.emoji}</span>
              <strong>{p.from} → {p.to}</strong>
              <small>from {p.price}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title"><span className="live-dot" /> Live departures</h2>
        <div className="board card">
          <div className="board-row head">
            <span>Time</span><span>Flight</span><span>Destination</span><span>Gate</span><span>Status</span>
          </div>
          {board.map((f) => (
            <div className="board-row" key={f._id}>
              <span className="mono">{fmtTime(f.departure)}</span>
              <span className="mono">{f.flightNumber}</span>
              <span>{f.fromCode} → {f.toCity}</span>
              <span className="mono">{f.gate}</span>
              <span className={`pill ${statusClass(f.status)}`}>{f.status}</span>
            </div>
          ))}
          {board.length === 0 && <div className="empty">Start the server &amp; run the seed script to see flights.</div>}
        </div>
      </section>

      <section className="section">
        <div className="grid-4">
          {FEATURES.map(([icon, title, text]) => (
            <div className="card feature" key={title}>
              <span className="emoji">{icon}</span>
              <strong>{title}</strong>
              <small>{text}</small>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
