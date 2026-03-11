const express = require('express');
const router = express.Router();
const organizationsController = require('../controllers/organizationsController');

// GET /api/organizations - Lấy danh sách tổ chức
router.get('/', organizationsController.getAllOrganizations);

// GET /api/organizations/:id - Lấy tổ chức theo ID
router.get('/:id', organizationsController.getOrganizationById);

// GET /api/organizations/:id/children - Lấy tổ chức con
router.get('/:id/children', organizationsController.getChildOrganizations);

// POST /api/organizations - Tạo tổ chức mới
router.post('/', organizationsController.createOrganization);

// PUT /api/organizations/:id - Cập nhật tổ chức
router.put('/:id', organizationsController.updateOrganization);

// DELETE /api/organizations/:id - Xóa tổ chức
router.delete('/:id', organizationsController.deleteOrganization);

module.exports = router;
