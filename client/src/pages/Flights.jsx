import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api';
import FlightCard from '../components/FlightCard';
import { durationMins } from '../utils';

export default function Flights() {
  const [params] = useSearchParams();
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('departure');
  const [airline, setAirline] = useState('all');
  const [maxPrice, setMaxPrice] = useState(0);

  const from = params.get('from') || '';
  const to = params.get('to') || '';
  const date = params.get('date') || '';

  useEffect(() => {
    setLoading(true);
    api
      .get('/flights', { params: { from, to, date } })
      .then((r) => {
        setFlights(r.data);
        setMaxPrice(Math.max(0, ...r.data.map((f) => f.price)));
      })
      .finally(() => setLoading(false));
  }, [from, to, date]);

  const highest = useMemo(() => Math.max(0, ...flights.map((f) => f.price)), [flights]);
  const airlines = useMemo(() => ['all', ...new Set(flights.map((f) => f.airline))], [flights]);

  const shown = useMemo(() => {
    let list = flights.filter((f) => (airline === 'all' || f.airline === airline) && f.price <= maxPrice);
    const by = {
      departure: (a, b) => new Date(a.departure) - new Date(b.departure),
      price: (a, b) => a.price - b.price,
      duration: (a, b) => durationMins(a.departure, a.arrival) - durationMins(b.departure, b.arrival),
    }[sort];
    return [...list].sort(by);
  }, [flights, airline, maxPrice, sort]);

  return (
    <div className="page">
      <div className="page-head">
        <h1>
          {from || 'Anywhere'} <span className="grad">→</span> {to || 'Anywhere'}
        </h1>
        <p>{loading ? 'Searching…' : `${shown.length} flight${shown.length === 1 ? '' : 's'} found`}</p>
      </div>

      <div className="layout-2">
        <aside className="card filters">
          <h3>Filters</h3>
          <label>
            <span>Sort by</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="departure">Earliest departure</option>
              <option value="price">Cheapest</option>
              <option value="duration">Shortest</option>
            </select>
          </label>
          <label>
            <span>Airline</span>
            <select value={airline} onChange={(e) => setAirline(e.target.value)}>
              {airlines.map((a) => <option key={a} value={a}>{a === 'all' ? 'All airlines' : a}</option>)}
            </select>
          </label>
          <label>
            <span>Max price: ₹{Number(maxPrice).toLocaleString('en-IN')}</span>
            <input
              type="range"
              min="0"
              max={highest}
              step="100"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
            />
          </label>
          <Link to="/" className="btn ghost sm">← New search</Link>
        </aside>

        <div className="list">
          {loading && [1, 2, 3].map((i) => <div key={i} className="card skeleton" />)}
          {!loading && shown.map((f) => <FlightCard key={f._id} flight={f} />)}
          {!loading && shown.length === 0 && (
            <div className="card empty">😕 No flights match. Try different cities or a different date.</div>
          )}
        </div>
      </div>
    </div>
  );
}
