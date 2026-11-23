const router = require('express').Router();
const c = require('../controllers/bookingController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/', protect, c.createBooking);
router.get('/mine', protect, c.myBookings);
router.get('/admin/all', protect, adminOnly, c.allBookings);
router.get('/admin/stats', protect, adminOnly, c.stats);
router.patch('/:id/cancel', protect, c.cancelBooking);

module.exports = router;
