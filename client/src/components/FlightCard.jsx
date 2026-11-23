import { Link } from 'react-router-dom';
import { fmtTime, fmtDate, duration, money } from '../utils';

export const statusClass = (s) =>
  ({ 'On Time': 'ok', Delayed: 'warn', Boarding: 'info', Cancelled: 'bad' }[s] || 'ok');

export default function FlightCard({ flight: f }) {
  const left = 120 - f.bookedSeats.length;
  const disabled = f.status === 'Cancelled' || left <= 0;

  return (
    <article className="card flight-card">
      <div className="fc-airline">
        <div className="airline-badge">{f.airline.slice(0, 2).toUpperCase()}</div>
        <div>
          <strong>{f.airline}</strong>
          <small>{f.flightNumber} · {f.terminal} · Gate {f.gate}</small>
        </div>
      </div>

      <div className="fc-route">
        <div className="fc-point">
          <h3>{fmtTime(f.departure)}</h3>
          <span className="code">{f.fromCode}</span>
          <small>{f.fromCity}</small>
        </div>
        <div className="fc-line">
          <small>{duration(f.departure, f.arrival)}</small>
          <div className="track"><span className="plane">✈</span></div>
          <small>{fmtDate(f.departure)}</small>
        </div>
        <div className="fc-point right">
          <h3>{fmtTime(f.arrival)}</h3>
          <span className="code">{f.toCode}</span>
          <small>{f.toCity}</small>
        </div>
      </div>

      <div className="fc-buy">
        <span className={`pill ${statusClass(f.status)}`}>{f.status}</span>
        <div className="price">{money(f.price)}</div>
        <small className={left < 20 ? 'low' : ''}>{left} seats left</small>
        {disabled ? (
          <button className="btn sm" disabled>Unavailable</button>
        ) : (
          <Link to={`/book/${f._id}`} className="btn sm">Select →</Link>
        )}
      </div>
    </article>
  );
}
