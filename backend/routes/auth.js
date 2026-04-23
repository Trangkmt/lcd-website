const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/authMiddleware');

// POST /api/auth/login - Đăng nhập bằng username hoặc email
router.post('/login', authController.login);
router.get('/me', requireAuth, authController.getMyProfile);
router.put('/me', requireAuth, authController.updateMyProfile);
router.put('/change-password', requireAuth, authController.changePassword);

module.exports = router;
