const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { optionalAuth, requireAuth } = require('../middleware/authMiddleware');

// GET /api/posts - Lấy danh sách bài viết
router.get('/', optionalAuth, postController.getAllPosts);

// GET /api/posts/slug/:slug - Lấy bài viết theo slug
router.get('/slug/:slug', postController.getPostBySlug);

// GET /api/posts/:id - Lấy bài viết theo ID
router.get('/:id', postController.getPostById);

// POST /api/posts - Tạo bài viết mới
router.post('/', requireAuth, postController.createPost);

// PUT /api/posts/:id - Cập nhật bài viết
router.put('/:id', requireAuth, postController.updatePost);

// DELETE /api/posts/:id - Xóa bài viết
router.delete('/:id', requireAuth, postController.deletePost);

module.exports = router;
