const express = require('express');
const router = express.Router();
const documentsController = require('../controllers/documentsController');
const { requireAuth, requireRoles } = require('../middleware/authMiddleware');
const { ROLES } = require('../config/roles');

// GET /api/documents - Lấy danh sách tài liệu
router.get('/', documentsController.getAllDocuments);

// GET /api/documents/:id - Lấy tài liệu theo ID
router.get('/:id', documentsController.getDocumentById);

// POST /api/documents - Tạo tài liệu mới
router.post('/', requireAuth, requireRoles(ROLES.ADMIN_FULL), documentsController.createDocument);

// POST /api/documents/:id/download - Tăng download count
router.post('/:id/download', documentsController.incrementDownload);

// PUT /api/documents/:id - Cập nhật tài liệu
router.put('/:id', requireAuth, requireRoles(ROLES.ADMIN_FULL), documentsController.updateDocument);

// DELETE /api/documents/:id - Xóa tài liệu
router.delete('/:id', requireAuth, requireRoles(ROLES.ADMIN_FULL), documentsController.deleteDocument);

module.exports = router;
