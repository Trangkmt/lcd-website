const express = require('express');
const router = express.Router();
const donationsController = require('../controllers/donationsController');

// GET /api/donations
router.get('/', donationsController.getAllDonations);

// GET /api/donations/stats
router.get('/stats', donationsController.getDonationStats);

// GET /api/donations/:id
router.get('/:id', donationsController.getDonationById);

// POST /api/donations
router.post('/', donationsController.createDonation);

// PUT /api/donations/:id/confirm
router.put('/:id/confirm', donationsController.confirmDonation);

// PUT /api/donations/:id/reject
router.put('/:id/reject', donationsController.rejectDonation);

// DELETE /api/donations/:id
router.delete('/:id', donationsController.deleteDonation);

module.exports = router;
