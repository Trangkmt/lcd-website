const express = require('express');
const router = express.Router();
const postTemplatesController = require('../controllers/postTemplatesController');
const { requireAuth } = require('../middleware/authMiddleware');

// GET /api/post-templates - Lấy danh sách template
router.get('/', requireAuth, postTemplatesController.getAllTemplates);

// POST /api/post-templates - Tạo template
router.post('/', requireAuth, postTemplatesController.createTemplate);

// PUT /api/post-templates/:id - Cập nhật template
router.put('/:id', requireAuth, postTemplatesController.updateTemplate);

// DELETE /api/post-templates/:id - Xóa template
router.delete('/:id', requireAuth, postTemplatesController.deleteTemplate);

module.exports = router;
