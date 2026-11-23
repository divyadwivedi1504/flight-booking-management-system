import { fmtTime, fmtDate, duration, money } from '../utils';

// Deterministic barcode generated from the PNR
function Barcode({ value }) {
  const bars = [];
  let x = 0;
  const str = (value + value).repeat(3);
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    const w = 1 + (code % 3);
    if (i % 2 === 0) bars.push(<rect key={i} x={x} y="0" width={w} height="44" />);
    x += w + 1;
  }
  return (
    <svg className="barcode" viewBox={`0 0 ${x} 44`} preserveAspectRatio="none">
      {bars}
    </svg>
  );
}

export default function BoardingPass({ booking: b, onCancel }) {
  const f = b.flight;
  if (!f) return null;
  const cancelled = b.status === 'Cancelled';
  const past = new Date(f.departure) < new Date();

  return (
    <div className={`pass ${cancelled ? 'cancelled' : ''}`}>
      <div className="pass-main">
        <div className="pass-top">
          <span className="brand"><span className="brand-icon">✈</span> Sky<b>Port</b> · Boarding Pass</span>
          <span className={`pill ${cancelled ? 'bad' : past ? 'info' : 'ok'}`}>
            {cancelled ? 'Cancelled' : past ? 'Completed' : 'Confirmed'}
          </span>
        </div>

        <div className="pass-route">
          <div>
            <h2>{f.fromCode}</h2>
            <small>{f.fromCity}</small>
            <strong>{fmtTime(f.departure)}</strong>
          </div>
          <div className="pass-mid">
            <span>{duration(f.departure, f.arrival)}</span>
            <div className="track"><span className="plane">✈</span></div>
            <span>{f.airline} · {f.flightNumber}</span>
          </div>
          <div className="right">
            <h2>{f.toCode}</h2>
            <small>{f.toCity}</small>
            <strong>{fmtTime(f.arrival)}</strong>
          </div>
        </div>

        <div className="pass-meta">
          <div><small>Date</small><b>{fmtDate(f.departure)}</b></div>
          <div><small>Terminal</small><b>{f.terminal}</b></div>
          <div><small>Gate</small><b>{f.gate}</b></div>
          <div><small>{cancelled ? 'Refund' : 'Total paid'}</small><b>{money(cancelled ? b.refundAmount : b.totalPrice)}</b></div>
        </div>

        <div className="pass-pax">
          {b.passengers.map((p) => (
            <div key={p.seat} className="pax">
              <span>{p.name} <small>({p.age}, {p.gender})</small></span>
              <b className="seat-tag">{p.seat}</b>
            </div>
          ))}
        </div>
      </div>

      <div className="pass-stub">
        <small>PNR</small>
        <div className="pnr">{b.pnr}</div>
        <Barcode value={b.pnr} />
        <div className="pass-actions">
          <button className="btn ghost sm" onClick={() => window.print()}>🖨 Print</button>
          {!cancelled && !past && (
            <button className="btn danger sm" onClick={() => onCancel(b)}>Cancel</button>
          )}
        </div>
      </div>
    </div>
  );
}
