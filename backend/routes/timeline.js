const express = require('express');
const router = express.Router();
const timelineController = require('../controllers/timelineController');
const { requireAuth, requireRoles } = require('../middleware/authMiddleware');
const { ROLES } = require('../config/roles');

// GET /api/timeline - Public timeline for homepage
router.get('/', timelineController.getPublicTimeline);

// GET /api/timeline/admin - Admin listing with drafts
router.get('/admin/list', requireAuth, requireRoles(ROLES.ADMIN_FULL), timelineController.getAdminTimeline);

// GET /api/timeline/:id - Public event detail
router.get('/:id', timelineController.getTimelineById);

// POST /api/timeline - Create timeline event
router.post('/', requireAuth, requireRoles(ROLES.ADMIN_FULL), timelineController.createTimelineEvent);

// PUT /api/timeline/:id - Update timeline event
router.put('/:id', requireAuth, requireRoles(ROLES.ADMIN_FULL), timelineController.updateTimelineEvent);

// DELETE /api/timeline/:id - Delete timeline event
router.delete('/:id', requireAuth, requireRoles(ROLES.ADMIN_FULL), timelineController.deleteTimelineEvent);

module.exports = router;
