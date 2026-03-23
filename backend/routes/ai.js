const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// POST /api/ai/generate-post - Tạo nội dung bài đăng bằng AI theo từ khóa
router.post('/generate-post', aiController.generatePost);

module.exports = router;
