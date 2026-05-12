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

function mapAuthUser(user) {
    if (!user) return null;
    return {
        ...user,
        role: normalizeRole(user.role),
    };
}

async function loadUserById(pool, userId) {
    const hasAvatarColumn = await hasUserAvatarColumn(pool);
    const avatarSelect = hasAvatarColumn ? 'avatar_url' : 'NULL AS avatar_url';
    const result = await pool.request()
        .input('id', sql.Int, userId)
        .query(`
            SELECT u.id, u.username, u.email, u.full_name, ${avatarSelect.replace('avatar_url', 'u.avatar_url')}, u.role, u.is_active,
                   u.member_type, u.student_code, u.class_name
            FROM users u
            WHERE u.id = @id
            LIMIT 1
        `);

    if (result.recordset.length === 0) return null;
    const user = result.recordset[0];

    const teamsResult = await pool.request()
        .input('id', sql.Int, userId)
        .query(`
            SELECT ut.team_id, ut.position as team_position, t.name as team_name
            FROM user_teams ut
            JOIN teams t ON ut.team_id = t.id
            WHERE ut.user_id = @id
        `);
    user.teams = teamsResult.recordset || [];

    return mapAuthUser(user);
}

/**
 * XỬ LÝ ĐĂNG NHẬP (POST /api/auth/login)
 * Luồng: Nhận thông tin -> Kiểm tra DB -> Tạo Token -> Trả về Client
 */
exports.login = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const identity = (username || email || '').trim();

        // 1. Kiểm tra đầu vào
        if (!identity || !password) {
            return res.status(400).json({ error: 'Vui lòng nhập username/email và password' });
        }

        const pool = await getConnection();
        const hasAvatarColumn = await hasUserAvatarColumn(pool);
        const avatarSelect = hasAvatarColumn ? 'avatar_url' : 'NULL AS avatar_url';

        // 2. Truy vấn tìm User khớp với username/email và mật khẩu
        const result = await pool.request()
            .input('identity', sql.NVarChar, identity)
            .input('password', sql.NVarChar, password)
            .query(`
                SELECT u.id, u.username, u.email, u.full_name, ${avatarSelect.replace('avatar_url', 'u.avatar_url')}, u.role, u.is_active,
                       u.member_type, u.student_code, u.class_name
                FROM users u
                WHERE (u.username = @identity OR u.email = @identity)
                  AND u.password = @password
                LIMIT 1
            `);

        // Nếu không tìm thấy bản ghi nào khớp
        if (result.recordset.length === 0) {
            return res.status(401).json({ error: 'Thông tin đăng nhập không đúng' });
        }

        const user = result.recordset[0];

        // 3. Tải danh sách các Ban mà người dùng tham gia
        const teamsResult = await pool.request()
            .input('id', sql.Int, user.id)
            .query(`
                SELECT ut.team_id, ut.position as team_position, t.name as team_name
                FROM user_teams ut
                JOIN teams t ON ut.team_id = t.id
                WHERE ut.user_id = @id
            `);
        user.teams = teamsResult.recordset || [];

        // 4. Kiểm tra tài khoản còn hoạt động không
        if (!user.is_active) {
            return res.status(403).json({ error: 'Tài khoản đã bị ẩn hoặc vô hiệu hóa' });
        }

        // 5. Chuẩn hóa thông tin và tạo Token
        const normalizedUser = mapAuthUser(user);
        const token = buildAuthToken(normalizedUser.id);

        // 6. Trả về kết quả cho Frontend
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

/**
 * LẤY THÔNG TIN TÀI KHOẢN ĐANG ĐĂNG NHẬP (GET /api/auth/me)
 * Dùng để hiển thị trang cá nhân hoặc kiểm tra trạng thái login khi reload trang.
 */
exports.getMyProfile = async (req, res) => {
    try {
        const pool = await getConnection();
        // req.authUser được nạp từ middleware verifyAuthToken
        const user = await loadUserById(pool, req.authUser?.id);

        if (!user) {
            return res.status(404).json({ error: 'Không tìm thấy tài khoản' });
        }

        return res.json(user);
    } catch (err) {
        console.error('Error:', err);
        return res.status(500).json({ error: err.message });
    }
};

// PUT /api/auth/me
exports.updateMyProfile = async (req, res) => {
    try {
        const { email, avatar_url } = req.body || {};

        if (!email || !String(email).trim()) {
            return res.status(400).json({ error: 'Email là bắt buộc' });
        }

        const pool = await getConnection();
        const hasAvatarColumn = await hasUserAvatarColumn(pool);
        const request = pool.request()
            .input('id', sql.Int, req.authUser?.id)
            .input('email', sql.NVarChar, String(email).trim());

        if (hasAvatarColumn) {
            request.input('avatar_url', sql.NVarChar, avatar_url ? String(avatar_url).trim() : null);
        }

        const avatarUpdatePart = hasAvatarColumn ? 'avatar_url = @avatar_url,' : '';
        const result = await request.query(`
            UPDATE users
            SET email = @email,
                ${avatarUpdatePart}
                updated_at = NOW()
            OUTPUT INSERTED.*
            WHERE id = @id
        `);

        if (!result.recordset?.length) {
            return res.status(404).json({ error: 'Không tìm thấy tài khoản' });
        }

        const updatedUser = await loadUserById(pool, req.authUser?.id);
        return res.json(updatedUser);
    } catch (err) {
        console.error('Error:', err);
        return res.status(500).json({ error: err.message });
    }
};

/**
 * ĐỔI MẬT KHẨU (PUT /api/auth/change-password)
 * Kiểm tra mật khẩu cũ -> Cập nhật mật khẩu mới
 */
exports.changePassword = async (req, res) => {
    try {
        const { password, newPassword } = req.body || {};

        // 1. Kiểm tra đầu vào
        if (!password || !newPassword) {
            return res.status(400).json({ error: 'Vui lòng nhập mật khẩu hiện tại và mật khẩu mới' });
        }

        if (String(newPassword).length < 6) {
            return res.status(400).json({ error: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
        }

        const pool = await getConnection();
        const request = pool.request()
            .input('id', sql.Int, req.authUser?.id)
            .input('password', sql.NVarChar, password)
            .input('newPassword', sql.NVarChar, newPassword);

        // 2. Chạy câu lệnh UPDATE (Chỉ thành công nếu đúng id và đúng password cũ)
        const result = await request.query(`
            UPDATE users
            SET password = @newPassword,
                updated_at = GETDATE()
            OUTPUT INSERTED.*
            WHERE id = @id
              AND password = @password
        `);

        // Nếu rowsAffected = 0 hoặc recordset rỗng tức là mật khẩu cũ sai
        if (!result.recordset?.length) {
            return res.status(400).json({ error: 'Mật khẩu hiện tại không đúng' });
        }

        return res.json({ message: 'Đổi mật khẩu thành công' });
    } catch (err) {
        console.error('Error:', err);
        return res.status(500).json({ error: err.message });
    }
};
