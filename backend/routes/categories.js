const express = require('express');
const router = express.Router();
const categoriesController = require('../controllers/categoriesController');
const { requireAuth, requireRoles } = require('../middleware/authMiddleware');
const { ROLES } = require('../config/roles');

// GET /api/categories - Lấy danh sách categories
router.get('/', categoriesController.getAllCategories);

// GET /api/categories/slug/:slug - Lấy category theo slug
router.get('/slug/:slug', categoriesController.getCategoryBySlug);

// GET /api/categories/:id - Lấy category theo ID
router.get('/:id', categoriesController.getCategoryById);

// POST /api/categories - Tạo category mới
router.post('/', requireAuth, requireRoles(ROLES.ADMIN_FULL), categoriesController.createCategory);

// PUT /api/categories/:id - Cập nhật category
router.put('/:id', requireAuth, requireRoles(ROLES.ADMIN_FULL), categoriesController.updateCategory);

// DELETE /api/categories/:id - Xóa category
router.delete('/:id', requireAuth, requireRoles(ROLES.ADMIN_FULL), categoriesController.deleteCategory);

module.exports = router;
