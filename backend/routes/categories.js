const express = require('express');
const router = express.Router();
const categoriesController = require('../controllers/categoriesController');

// GET /api/categories - Lấy danh sách categories
router.get('/', categoriesController.getAllCategories);

// GET /api/categories/:id - Lấy category theo ID
router.get('/:id', categoriesController.getCategoryById);

// POST /api/categories - Tạo category mới
router.post('/', categoriesController.createCategory);

// PUT /api/categories/:id - Cập nhật category
router.put('/:id', categoriesController.updateCategory);

// DELETE /api/categories/:id - Xóa category
router.delete('/:id', categoriesController.deleteCategory);

module.exports = router;
