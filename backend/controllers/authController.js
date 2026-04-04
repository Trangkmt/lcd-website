const { getConnection, sql } = require('../database/connection-sqlserver.js');
const { buildAuthToken } = require('../middleware/authMiddleware');
const { normalizeRole } = require('../config/roles');

async function hasUserAvatarColumn(pool) {
    const result = await pool.request().query(`
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'users'
          AND COLUMN_NAME = 'avatar_url'
        LIMIT 1
    `);
    return (result.recordset || []).length > 0;
}

// POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const identity = (username || email || '').trim();

        if (!identity || !password) {
            return res.status(400).json({ error: 'Vui lòng nhập username/email và password' });
        }

        const pool = await getConnection();
        const hasAvatarColumn = await hasUserAvatarColumn(pool);
        const avatarSelect = hasAvatarColumn ? 'avatar_url' : 'NULL AS avatar_url';
        const result = await pool.request()
            .input('identity', sql.NVarChar, identity)
            .input('password', sql.NVarChar, password)
            .query(`
                SELECT id, username, email, full_name, ${avatarSelect}, role, is_active,
                       member_type, student_code, class_name, department, department_position
                FROM users
                WHERE (username = @identity OR email = @identity)
                  AND password = @password
                LIMIT 1
            `);

        if (result.recordset.length === 0) {
            return res.status(401).json({ error: 'Thông tin đăng nhập không đúng' });
        }

        const user = result.recordset[0];
        if (!user.is_active) {
            return res.status(403).json({ error: 'Tài khoản đã bị ẩn hoặc vô hiệu hóa' });
        }

        const normalizedUser = {
            ...user,
            role: normalizeRole(user.role),
        };
        const token = buildAuthToken(normalizedUser.id);

        res.json({
            message: 'Đăng nhập thành công',
            user: normalizedUser,
            token,
        });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: err.message });
    }
};
