require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Flight = require('./models/Flight');
const Booking = require('./models/Booking');

const CITIES = {
  DEL: 'Delhi', BOM: 'Mumbai', BLR: 'Bengaluru', IDR: 'Indore', HYD: 'Hyderabad',
  CCU: 'Kolkata', GOI: 'Goa', MAA: 'Chennai', DXB: 'Dubai', SIN: 'Singapore', LHR: 'London',
};
const AIRLINES = [
  ['SkyJet', 'SJ'], ['AeroWings', 'AW'], ['IndiGo Air', '6E'], ['Vista Airways', 'VA'], ['Nimbus', 'NB'],
];

// [from, to, durationMinutes, basePrice]
const ROUTES = [
  ['IDR', 'DEL', 100, 4200], ['DEL', 'IDR', 100, 4300], ['IDR', 'BOM', 80, 3600],
  ['BOM', 'IDR', 80, 3700], ['DEL', 'BOM', 130, 5200], ['BOM', 'DEL', 130, 5100],
  ['BLR', 'DEL', 170, 6100], ['DEL', 'BLR', 170, 6200], ['HYD', 'GOI', 80, 3300],
  ['CCU', 'BLR', 150, 5400], ['MAA', 'DEL', 175, 6000], ['BOM', 'GOI', 70, 2900],
  ['DEL', 'DXB', 215, 14500], ['BOM', 'SIN', 340, 21500], ['DEL', 'LHR', 600, 48000],
  ['BLR', 'HYD', 75, 2800], ['IDR', 'BLR', 130, 5000], ['DEL', 'GOI', 160, 6400],
];

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all([User.deleteMany(), Flight.deleteMany(), Booking.deleteMany()]);

  const pw = await bcrypt.hash('admin123', 10);
  await User.create({ name: 'SkyPort Admin', email: 'admin@skyport.com', password: pw, role: 'admin' });
  await User.create({ name: 'Demo Traveler', email: 'user@skyport.com', password: await bcrypt.hash('user123', 10) });

  const flights = [];
  for (let day = 0; day < 10; day++) {
    ROUTES.forEach(([from, to, dur, price], i) => {
      // two departures per route per day
      [0, 1].forEach((slot) => {
        const [airline, code] = AIRLINES[(i + slot + day) % AIRLINES.length];
        const dep = new Date();
        dep.setDate(dep.getDate() + day);
        dep.setHours(slot === 0 ? 6 + (i % 6) : 15 + (i % 6), (i * 15) % 60, 0, 0);
        if (dep < new Date()) return; // skip past departures today
        const arr = new Date(dep.getTime() + dur * 60000);
        const variance = 1 + ((i * 7 + slot * 13 + day * 5) % 20) / 100;
        flights.push({
          airline,
          flightNumber: `${code}${100 + ((i * 17 + slot * 53 + day * 3) % 900)}`,
          fromCode: from, fromCity: CITIES[from], toCode: to, toCity: CITIES[to],
          departure: dep, arrival: arr,
          price: Math.round((price * variance) / 10) * 10,
          gate: `${'ABCD'[i % 4]}${1 + ((i + slot) % 20)}`,
          terminal: `T${1 + (i % 3)}`,
          status: ['On Time', 'On Time', 'On Time', 'Delayed', 'Boarding'][(i + slot) % 5],
          bookedSeats: Array.from({ length: 12 }, () => `${5 + Math.floor(Math.random() * 16)}${'ABCDEF'[Math.floor(Math.random() * 6)]}`)
            .filter((s, idx, arr2) => arr2.indexOf(s) === idx),
        });
      });
    });
  }
  await Flight.insertMany(flights);
  console.log(`🌱 Seeded ${flights.length} flights + 2 users`);
  console.log('   Admin : admin@skyport.com / admin123');
  console.log('   User  : user@skyport.com  / user123');
  process.exit(0);
})();
