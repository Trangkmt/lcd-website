const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');

// GET /api/news - Lấy danh sách tin tức
router.get('/', newsController.getAllNews);

// GET /api/news/slug/:slug - Lấy tin tức theo slug
router.get('/slug/:slug', newsController.getNewsBySlug);

// GET /api/news/:id - Lấy tin tức theo ID
router.get('/:id', newsController.getNewsById);

// POST /api/news - Tạo tin tức mới
router.post('/', newsController.createNews);

// PUT /api/news/:id - Cập nhật tin tức
router.put('/:id', newsController.updateNews);

// DELETE /api/news/:id - Xóa tin tức
router.delete('/:id', newsController.deleteNews);

module.exports = router;
