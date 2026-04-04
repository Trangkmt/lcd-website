const express = require('express');
const router = express.Router();
const activitiesController = require('../controllers/activitiesController');
const { requireAuth, requireRoles } = require('../middleware/authMiddleware');
const { ROLES } = require('../config/roles');

// GET /api/activities - Lấy danh sách hoạt động
router.get('/', activitiesController.getAllActivities);

// GET /api/activities/year/:year - Lấy hoạt động theo năm
router.get('/year/:year', activitiesController.getActivitiesByYear);

// GET /api/activities/slug/:slug - Lấy hoạt động theo slug
router.get('/slug/:slug', activitiesController.getActivityBySlug);

// GET /api/activities/:id - Lấy hoạt động theo ID
router.get('/:id', activitiesController.getActivityById);

// POST /api/activities - Tạo hoạt động mới
router.post('/', requireAuth, requireRoles(ROLES.ADMIN_FULL), activitiesController.createActivity);

// PUT /api/activities/:id - Cập nhật hoạt động
router.put('/:id', requireAuth, requireRoles(ROLES.ADMIN_FULL), activitiesController.updateActivity);

// DELETE /api/activities/:id - Xóa hoạt động
router.delete('/:id', requireAuth, requireRoles(ROLES.ADMIN_FULL), activitiesController.deleteActivity);

module.exports = router;
