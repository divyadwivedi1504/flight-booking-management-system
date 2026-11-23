const Flight = require('../models/Flight');

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/flights?from=&to=&date=YYYY-MM-DD
exports.getFlights = async (req, res, next) => {
  try {
    const { from, to, date } = req.query;
    const q = {};
    if (from) {
      const r = new RegExp(escape(from.trim()), 'i');
      q.$or = [{ fromCode: r }, { fromCity: r }];
    }
    if (to) {
      const r = new RegExp(escape(to.trim()), 'i');
      q.$and = [{ $or: [{ toCode: r }, { toCity: r }] }];
    }
    if (date) {
      // Treat the date as an IST day (UTC+5:30)
      const start = new Date(`${date}T00:00:00+05:30`);
      const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
      q.departure = { $gte: start, $lt: end };
    } else {
      q.departure = { $gte: new Date() };
    }
    const flights = await Flight.find(q).sort({ departure: 1 });
    res.json(flights);
  } catch (err) {
    next(err);
  }
};

exports.getFlight = async (req, res, next) => {
  try {
    const flight = await Flight.findById(req.params.id);
    if (!flight) return res.status(404).json({ message: 'Flight not found' });
    res.json(flight);
  } catch (err) {
    next(err);
  }
};

exports.createFlight = async (req, res, next) => {
  try {
    const f = req.body;
    if (new Date(f.arrival) <= new Date(f.departure))
      return res.status(400).json({ message: 'Arrival must be after departure' });
    const flight = await Flight.create(f);
    res.status(201).json(flight);
  } catch (err) {
    next(err);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const flight = await Flight.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );
    if (!flight) return res.status(404).json({ message: 'Flight not found' });
    res.json(flight);
  } catch (err) {
    next(err);
  }
};

exports.deleteFlight = async (req, res, next) => {
  try {
    await Flight.findByIdAndDelete(req.params.id);
    res.json({ message: 'Flight deleted' });
  } catch (err) {
    next(err);
  }
};
