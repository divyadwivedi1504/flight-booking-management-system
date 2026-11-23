const router = require('express').Router();
const c = require('../controllers/flightController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', c.getFlights);
router.get('/:id', c.getFlight);
router.post('/', protect, adminOnly, c.createFlight);
router.patch('/:id/status', protect, adminOnly, c.updateStatus);
router.delete('/:id', protect, adminOnly, c.deleteFlight);

module.exports = router;
