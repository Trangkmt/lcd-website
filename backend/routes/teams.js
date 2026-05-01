const express = require('express');
const router = express.Router();
const teamsController = require('../controllers/teamsController');

// GET /api/teams - Lấy danh sách tổ chức
router.get('/', teamsController.getAllTeams);

// GET /api/teams/:id - Lấy tổ chức theo ID
router.get('/:id', teamsController.getTeamById);

module.exports = router;
