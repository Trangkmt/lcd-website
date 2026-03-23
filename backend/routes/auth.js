const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/login - Đăng nhập bằng username hoặc email
router.post('/login', authController.login);

module.exports = router;
