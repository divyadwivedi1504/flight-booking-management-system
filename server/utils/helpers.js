// Business class = rows 1-4 (2.2x price). Everything else is economy.
exports.seatPrice = (basePrice, seat) => {
  const row = parseInt(seat, 10);
  return row <= 4 ? Math.round(basePrice * 2.2) : basePrice;
};

exports.VALID_SEAT = /^([1-9]|1\d|20)[A-F]$/;

exports.generatePNR = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
};
