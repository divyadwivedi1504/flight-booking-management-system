import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api, { errMsg } from '../api';
import BoardingPass from '../components/BoardingPass';
import { money } from '../utils';

export default function MyBookings() {
  const { state } = useLocation();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const load = () =>
    api.get('/bookings/mine').then((r) => setList(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const cancel = async (b) => {
    if (!window.confirm(`Cancel booking ${b.pnr}? You will get ${money(Math.round(b.totalPrice * 0.9))} back (90%).`)) return;
    try {
      await api.patch(`/bookings/${b._id}/cancel`);
      setMsg(`Booking ${b.pnr} cancelled. Refund initiated.`);
      load();
    } catch (e) {
      setMsg(errMsg(e));
    }
  };

  return (
    <div className="page">
      <div className="page-head">
        <h1>My <span className="grad">trips</span></h1>
        <p>All your boarding passes in one place.</p>
      </div>

      {state?.pnr && (
        <div className="success">🎉 Booking confirmed! Your PNR is <b>{state.pnr}</b>. Have a great flight!</div>
      )}
      {msg && <div className="alert">{msg}</div>}

      {loading && <div className="card skeleton" />}
      {!loading && list.length === 0 && (
        <div className="card empty">
          No bookings yet. <Link to="/flights" className="link">Find a flight →</Link>
        </div>
      )}
      <div className="stack">
        {list.map((b) => <BoardingPass key={b._id} booking={b} onCancel={cancel} />)}
      </div>
    </div>
  );
}
