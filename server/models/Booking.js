const mongoose = require('mongoose');

const passengerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 0, max: 120 },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Other' },
    seat: { type: String, required: true },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    flight: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight', required: true },
    pnr: { type: String, required: true, unique: true },
    passengers: { type: [passengerSchema], required: true },
    totalPrice: { type: Number, required: true },
    refundAmount: { type: Number, default: 0 },
    status: { type: String, enum: ['Confirmed', 'Cancelled'], default: 'Confirmed' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
