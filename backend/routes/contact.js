const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { requireAuth, requireRoles } = require('../middleware/authMiddleware');
const { ROLES } = require('../config/roles');

// GET /api/contact - Lấy danh sách liên hệ
router.get('/', requireAuth, requireRoles([ROLES.ADMIN_FULL, ROLES.CONTACT_MANAGER]), contactController.getAllContacts);

// GET /api/contact/stats - Thống kê liên hệ
router.get('/stats', requireAuth, requireRoles([ROLES.ADMIN_FULL, ROLES.CONTACT_MANAGER]), contactController.getContactStats);

// GET /api/contact/:id - Lấy liên hệ theo ID
router.get('/:id', requireAuth, requireRoles([ROLES.ADMIN_FULL, ROLES.CONTACT_MANAGER]), contactController.getContactById);

// POST /api/contact - Tạo liên hệ mới
router.post('/', contactController.createContact);

// PUT /api/contact/:id/read - Đánh dấu đã đọc
router.put('/:id/read', requireAuth, requireRoles([ROLES.ADMIN_FULL, ROLES.CONTACT_MANAGER]), contactController.markAsRead);

// PUT /api/contact/:id/reply - Đánh dấu đã trả lời
router.put('/:id/reply', requireAuth, requireRoles([ROLES.ADMIN_FULL, ROLES.CONTACT_MANAGER]), contactController.markAsReplied);

// DELETE /api/contact/:id - Xóa liên hệ
router.delete('/:id', requireAuth, requireRoles([ROLES.ADMIN_FULL, ROLES.CONTACT_MANAGER]), contactController.deleteContact);

module.exports = router;
