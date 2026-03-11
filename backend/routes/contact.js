const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

// GET /api/contact - Lấy danh sách liên hệ
router.get('/', contactController.getAllContacts);

// GET /api/contact/stats - Thống kê liên hệ
router.get('/stats', contactController.getContactStats);

// GET /api/contact/:id - Lấy liên hệ theo ID
router.get('/:id', contactController.getContactById);

// POST /api/contact - Tạo liên hệ mới
router.post('/', contactController.createContact);

// PUT /api/contact/:id/read - Đánh dấu đã đọc
router.put('/:id/read', contactController.markAsRead);

// PUT /api/contact/:id/reply - Đánh dấu đã trả lời
router.put('/:id/reply', contactController.markAsReplied);

// DELETE /api/contact/:id - Xóa liên hệ
router.delete('/:id', contactController.deleteContact);

module.exports = router;
