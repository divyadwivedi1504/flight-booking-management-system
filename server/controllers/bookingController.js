const Booking = require('../models/Booking');
const Flight = require('../models/Flight');
const User = require('../models/User');
const { seatPrice, VALID_SEAT, generatePNR } = require('../utils/helpers');

// POST /api/bookings   { flightId, passengers: [{name, age, gender, seat}] }
exports.createBooking = async (req, res, next) => {
  try {
    const { flightId, passengers } = req.body;
    if (!flightId || !Array.isArray(passengers) || passengers.length === 0)
      return res.status(400).json({ message: 'Flight and passengers are required' });
    if (passengers.length > 6)
      return res.status(400).json({ message: 'Maximum 6 passengers per booking' });

    const seats = passengers.map((p) => p.seat);
    if (new Set(seats).size !== seats.length)
      return res.status(400).json({ message: 'Duplicate seats selected' });
    if (seats.some((s) => !VALID_SEAT.test(s)))
      return res.status(400).json({ message: 'Invalid seat number' });
    if (passengers.some((p) => !p.name || !p.name.trim() || p.age === undefined || p.age === ''))
      return res.status(400).json({ message: 'Every passenger needs a name and age' });

    const flight = await Flight.findById(flightId);
    if (!flight) return res.status(404).json({ message: 'Flight not found' });
    if (flight.status === 'Cancelled')
      return res.status(400).json({ message: 'This flight has been cancelled' });
    if (flight.departure < new Date())
      return res.status(400).json({ message: 'This flight has already departed' });

    const totalPrice = seats.reduce((sum, s) => sum + seatPrice(flight.price, s), 0);

    // Atomic seat lock: succeeds only if NONE of the seats are already booked
    const locked = await Flight.findOneAndUpdate(
      { _id: flightId, bookedSeats: { $nin: seats } },
      { $push: { bookedSeats: { $each: seats } } },
      { new: true }
    );
    if (!locked)
      return res.status(409).json({ message: 'One or more seats were just taken. Please pick again.' });

    const booking = await Booking.create({
      user: req.user._id,
      flight: flightId,
      pnr: generatePNR(),
      passengers,
      totalPrice,
    });
    res.status(201).json(await booking.populate('flight'));
  } catch (err) {
    next(err);
  }
};

// GET /api/bookings/mine
exports.myBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('flight')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/bookings/:id/cancel  (90% refund)
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('flight');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    const isOwner = booking.user.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not allowed' });
    if (booking.status === 'Cancelled')
      return res.status(400).json({ message: 'Already cancelled' });
    if (booking.flight && booking.flight.departure < new Date())
      return res.status(400).json({ message: 'Cannot cancel a departed flight' });

    const seats = booking.passengers.map((p) => p.seat);
    await Flight.findByIdAndUpdate(booking.flight._id, { $pull: { bookedSeats: { $in: seats } } });

    booking.status = 'Cancelled';
    booking.refundAmount = Math.round(booking.totalPrice * 0.9);
    await booking.save();
    res.json(booking);
  } catch (err) {
    next(err);
  }
};

// ----- Admin -----
exports.allBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate('flight')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

exports.stats = async (req, res, next) => {
  try {
    const [bookings, flights, users, revenueAgg] = await Promise.all([
      Booking.countDocuments({ status: 'Confirmed' }),
      Flight.countDocuments(),
      User.countDocuments({ role: 'user' }),
      Booking.aggregate([
        { $match: { status: 'Confirmed' } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
    ]);
    res.json({ bookings, flights, users, revenue: revenueAgg[0] ? revenueAgg[0].total : 0 });
  } catch (err) {
    next(err);
  }
};
