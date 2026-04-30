const express = require('express');
const router = express.Router();
const teamsController = require('../controllers/teamsController');
const { requireAuth, requireRoles } = require('../middleware/authMiddleware');
const { ROLES } = require('../config/roles');

// GET /api/teams - Lấy danh sách tổ chức
router.get('/', teamsController.getAllTeams);

// GET /api/teams/:id - Lấy tổ chức theo ID
router.get('/:id', teamsController.getTeamById);


// POST /api/teams - Tạo tổ chức mới
router.post('/', requireAuth, requireRoles(ROLES.ADMIN_FULL), teamsController.createTeam);

// PUT /api/teams/:id - Cập nhật tổ chức
router.put('/:id', requireAuth, requireRoles(ROLES.ADMIN_FULL), teamsController.updateTeam);

// DELETE /api/teams/:id - Xóa tổ chức
router.delete('/:id', requireAuth, requireRoles(ROLES.ADMIN_FULL), teamsController.deleteTeam);

module.exports = router;
