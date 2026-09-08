const express = require('express');
const authenticate = require('../middleware/authMiddleware');
const { getDashboard } = require('../controllers/protectedController');

const router = express.Router();

router.get('/dashboard', authenticate, getDashboard);

module.exports = router;
