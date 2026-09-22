const express = require('express');
const authenticate = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/rbacMiddleware');
const { createGig, getGigs, updateGig, deleteGig } = require('../controllers/gigController');

const router = express.Router();
router.get('/', authenticate, getGigs);
router.post('/', authenticate, authorizeRoles('client'), createGig);
router.put('/:id', authenticate, authorizeRoles('freelancer', 'admin'), updateGig);
router.delete('/:id', authenticate, authorizeRoles('freelancer', 'admin'), deleteGig);

module.exports = router;
