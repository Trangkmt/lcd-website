const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const { requireAuth, requireRoles } = require('../middleware/authMiddleware');
const { ROLES } = require('../config/roles');

// GET /api/users/public - Public members list for user-facing pages
router.get('/public', usersController.getPublicUsers);

router.use(requireAuth, requireRoles(ROLES.ADMIN_FULL));

// GET /api/users - Lấy danh sách users
router.get('/', usersController.getAllUsers);

// GET /api/users/:id - Lấy user theo ID
router.get('/:id', usersController.getUserById);

// POST /api/users - Tạo user mới
router.post('/', usersController.createUser);

// PUT /api/users/:id - Cập nhật user
router.put('/:id', usersController.updateUser);

// DELETE /api/users/:id - Xóa user
router.delete('/:id', usersController.deleteUser);

module.exports = router;
