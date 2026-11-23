export const fmtTime = (d) =>
  new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });

export const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' });

export const duration = (a, b) => {
  const m = Math.round((new Date(b) - new Date(a)) / 60000);
  return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m`;
};

export const durationMins = (a, b) => Math.round((new Date(b) - new Date(a)) / 60000);

export const money = (n) => '₹' + Number(n).toLocaleString('en-IN');

// Must match server/utils/helpers.js — rows 1-4 are Business (2.2x)
export const seatPrice = (base, seat) => (parseInt(seat, 10) <= 4 ? Math.round(base * 2.2) : base);

export const todayISO = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};
