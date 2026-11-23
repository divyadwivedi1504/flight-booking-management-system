const ROWS = 20;
const COLS = ['A', 'B', 'C', 'D', 'E', 'F'];

// rows 1-4 = Business, rows 5-20 = Economy. Aisle between C and D.
export default function SeatMap({ booked, selected, onToggle }) {
  return (
    <div className="seatmap">
      <div className="plane-nose">COCKPIT</div>
      <div className="seat-head">
        {COLS.slice(0, 3).map((c) => <span key={c}>{c}</span>)}
        <span className="aisle" />
        {COLS.slice(3).map((c) => <span key={c}>{c}</span>)}
      </div>

      {Array.from({ length: ROWS }, (_, i) => i + 1).map((row) => (
        <div key={row}>
          {row === 1 && <div className="cabin-label">Business · 2.2× fare</div>}
          {row === 5 && <div className="cabin-label">Economy</div>}
          <div className={`seat-row ${row <= 4 ? 'biz' : ''}`}>
            {COLS.map((c, idx) => {
              const id = `${row}${c}`;
              const isBooked = booked.includes(id);
              const isSel = selected.includes(id);
              return (
                <span key={id} className="seat-wrap">
                  {idx === 3 && <span className="aisle"><em>{row}</em></span>}
                  <button
                    type="button"
                    disabled={isBooked}
                    className={`seat ${isBooked ? 'taken' : ''} ${isSel ? 'sel' : ''}`}
                    onClick={() => onToggle(id)}
                    title={isBooked ? `${id} (taken)` : id}
                  >
                    {isBooked ? '✕' : ''}
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      ))}

      <div className="legend">
        <span><i className="seat" /> Available</span>
        <span><i className="seat sel" /> Selected</span>
        <span><i className="seat taken" /> Taken</span>
      </div>
    </div>
  );
}
