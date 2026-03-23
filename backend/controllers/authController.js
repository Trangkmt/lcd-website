const { getConnection, sql } = require('../database/connection-sqlserver.js');

// POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const identity = (username || email || '').trim();

        if (!identity || !password) {
            return res.status(400).json({ error: 'Vui lòng nhập username/email và password' });
        }

        const pool = await getConnection();
        const result = await pool.request()
            .input('identity', sql.NVarChar, identity)
            .input('password', sql.NVarChar, password)
            .query(`
                SELECT id, username, email, full_name, role, is_active,
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

        res.json({
            message: 'Đăng nhập thành công',
            user,
        });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: err.message });
    }
};
