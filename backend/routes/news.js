const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const { optionalAuth, requireAuth } = require('../middleware/authMiddleware');

// GET /api/news - Lấy danh sách tin tức
router.get('/', optionalAuth, newsController.getAllNews);

// GET /api/news/slug/:slug - Lấy tin tức theo slug
router.get('/slug/:slug', newsController.getNewsBySlug);

// GET /api/news/:id - Lấy tin tức theo ID
router.get('/:id', newsController.getNewsById);

// POST /api/news - Tạo tin tức mới
router.post('/', requireAuth, newsController.createNews);

// PUT /api/news/:id - Cập nhật tin tức
router.put('/:id', requireAuth, newsController.updateNews);

// DELETE /api/news/:id - Xóa tin tức
router.delete('/:id', requireAuth, newsController.deleteNews);

module.exports = router;
