const express = require('express');
const router = express.Router();
const documentsController = require('../controllers/documentsController');

// GET /api/documents - Lấy danh sách tài liệu
router.get('/', documentsController.getAllDocuments);

// GET /api/documents/:id - Lấy tài liệu theo ID
router.get('/:id', documentsController.getDocumentById);

// POST /api/documents - Tạo tài liệu mới
router.post('/', documentsController.createDocument);

// POST /api/documents/:id/download - Tăng download count
router.post('/:id/download', documentsController.incrementDownload);

// PUT /api/documents/:id - Cập nhật tài liệu
router.put('/:id', documentsController.updateDocument);

// DELETE /api/documents/:id - Xóa tài liệu
router.delete('/:id', documentsController.deleteDocument);

module.exports = router;
