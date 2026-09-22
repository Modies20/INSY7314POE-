const express = require('express');
const authenticate = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/rbacMiddleware');
const { createBooking, getMyBookings, getMyTransactions } = require('../controllers/bookingController');

const router = express.Router();
router.post('/', authenticate, authorizeRoles('client'), createBooking);
router.get('/', authenticate, authorizeRoles('client', 'freelancer', 'admin'), getMyBookings);
router.get('/transactions', authenticate, authorizeRoles('freelancer', 'admin'), getMyTransactions);

module.exports = router;
