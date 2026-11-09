const express = require('express');
const authenticate = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/rbacMiddleware');
const { getTaxEstimate } = require('../controllers/taxController');

const router = express.Router();

router.get('/estimate', authenticate, authorizeRoles('freelancer'), getTaxEstimate);

module.exports = router;
