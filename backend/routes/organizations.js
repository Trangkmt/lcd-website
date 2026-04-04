const express = require('express');
const router = express.Router();
const organizationsController = require('../controllers/organizationsController');
const { requireAuth, requireRoles } = require('../middleware/authMiddleware');
const { ROLES } = require('../config/roles');

// GET /api/organizations - Lấy danh sách tổ chức
router.get('/', organizationsController.getAllOrganizations);

// GET /api/organizations/:id - Lấy tổ chức theo ID
router.get('/:id', organizationsController.getOrganizationById);

// GET /api/organizations/:id/children - Lấy tổ chức con
router.get('/:id/children', organizationsController.getChildOrganizations);

// POST /api/organizations - Tạo tổ chức mới
router.post('/', requireAuth, requireRoles(ROLES.ADMIN_FULL), organizationsController.createOrganization);

// PUT /api/organizations/:id - Cập nhật tổ chức
router.put('/:id', requireAuth, requireRoles(ROLES.ADMIN_FULL), organizationsController.updateOrganization);

// DELETE /api/organizations/:id - Xóa tổ chức
router.delete('/:id', requireAuth, requireRoles(ROLES.ADMIN_FULL), organizationsController.deleteOrganization);

module.exports = router;
