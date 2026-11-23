const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema(
  {
    airline: { type: String, required: true },
    flightNumber: { type: String, required: true },
    fromCode: { type: String, required: true, uppercase: true },
    fromCity: { type: String, required: true },
    toCode: { type: String, required: true, uppercase: true },
    toCity: { type: String, required: true },
    departure: { type: Date, required: true },
    arrival: { type: Date, required: true },
    price: { type: Number, required: true, min: 0 }, // base economy price per seat
    gate: { type: String, default: 'TBA' },
    terminal: { type: String, default: 'T1' },
    status: {
      type: String,
      enum: ['On Time', 'Delayed', 'Boarding', 'Cancelled'],
      default: 'On Time',
    },
    bookedSeats: { type: [String], default: [] }, // e.g. ["1A", "12C"]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Flight', flightSchema);
