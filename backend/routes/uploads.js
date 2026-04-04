const express = require('express');
const router = express.Router();
const uploadsController = require('../controllers/uploadsController');
const { requireAuth } = require('../middleware/authMiddleware');

router.post('/image', requireAuth, uploadsController.uploadImage);

module.exports = router;
