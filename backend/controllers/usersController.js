const { getConnection, sql } = require('../database/connection-sqlserver.js');
const { ROLES, normalizeRole } = require('../config/roles');

function mapUserRole(user) {
    if (!user) return user;
    return {
        ...user,
        role: normalizeRole(user.role),
    };
}

function sanitizeIncomingRole(role) {
    return normalizeRole(role || ROLES.POST_AUTHOR);
}

function sanitizeDepartmentPosition(value) {
    if (value === undefined || value === null) return null;

    if (typeof value === 'object') {
        const asJson = JSON.stringify(value);
        return asJson === '{}' ? null : asJson;
    }

    const asText = String(value).trim();
    return asText || null;
}

function mapPublicUser(user) {
    if (!user) return user;
    return {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        avatar_url: user.avatar_url || null,
        member_type: user.member_type,
        student_code: user.student_code,
        class_name: user.class_name,
        department: user.department,
        department_position: user.department_position,
        is_active: user.is_active,
    };
}

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

// GET /api/users - Lấy danh sách users
exports.getAllUsers = async (req, res) => {
    try {
        const pool = await getConnection();
        const hasAvatarColumn = await hasUserAvatarColumn(pool);
        const avatarSelect = hasAvatarColumn ? 'avatar_url' : 'NULL AS avatar_url';
        const result = await pool.request().query(`
            SELECT id, username, email, full_name, ${avatarSelect}, role, is_active,
                   member_type, student_code, class_name, department, department_position,
                   created_at, updated_at
            FROM users
            ORDER BY created_at DESC
        `);
        res.json((result.recordset || []).map(mapUserRole));
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: err.message });
    }
};

// GET /api/users/public - Lấy danh sách thành viên public
exports.getPublicUsers = async (req, res) => {
    try {
        const pool = await getConnection();
        const hasAvatarColumn = await hasUserAvatarColumn(pool);
        const avatarSelect = hasAvatarColumn ? 'avatar_url' : 'NULL AS avatar_url';

        const result = await pool.request().query(`
            SELECT id, email, full_name, ${avatarSelect}, is_active,
                   member_type, student_code, class_name, department, department_position
            FROM users
            WHERE is_active = 1
            ORDER BY full_name ASC
        `);

        res.json((result.recordset || []).map(mapPublicUser));
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: err.message });
    }
};

// GET /api/users/:id - Lấy user theo ID
exports.getUserById = async (req, res) => {
    try {
        const pool = await getConnection();
        const hasAvatarColumn = await hasUserAvatarColumn(pool);
        const avatarSelect = hasAvatarColumn ? 'avatar_url' : 'NULL AS avatar_url';
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query(`
                SELECT id, username, email, full_name, ${avatarSelect}, role, is_active,
                       member_type, student_code, class_name, department, department_position,
                       created_at, updated_at
                FROM users
                WHERE id = @id
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'User không tồn tại' });
        }
        res.json(mapUserRole(result.recordset[0]));
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: err.message });
    }
};

// POST /api/users - Tạo user mới
exports.createUser = async (req, res) => {
    try {
        const {
            username,
            password,
            email,
            full_name,
            avatar_url,
            role,
            member_type,
            student_code,
            class_name,
            department,
            department_position
        } = req.body;

        if (!username || !password || !email) {
            return res.status(400).json({ error: 'Username, password và email là bắt buộc' });
        }

        const pool = await getConnection();
        const hasAvatarColumn = await hasUserAvatarColumn(pool);
        const request = pool.request()
            .input('username', sql.NVarChar, username)
            .input('password', sql.NVarChar, password) // Lưu ý: Nên hash password trước khi lưu
            .input('email', sql.NVarChar, email)
            .input('full_name', sql.NVarChar, full_name || null)
            .input('role', sql.NVarChar, sanitizeIncomingRole(role))
            .input('member_type', sql.NVarChar, member_type || 'student')
            .input('student_code', sql.NVarChar, student_code || null)
            .input('class_name', sql.NVarChar, class_name || null)
            .input('department', sql.NVarChar, department || null)
            .input('department_position', sql.NVarChar, sanitizeDepartmentPosition(department_position));

        if (hasAvatarColumn) {
            request.input('avatar_url', sql.NVarChar, avatar_url || null);
        }

        const insertColumns = hasAvatarColumn
            ? 'username, password, email, full_name, avatar_url, role, member_type, student_code, class_name, department, department_position'
            : 'username, password, email, full_name, role, member_type, student_code, class_name, department, department_position';
        const insertValues = hasAvatarColumn
            ? '@username, @password, @email, @full_name, @avatar_url, @role, @member_type, @student_code, @class_name, @department, @department_position'
            : '@username, @password, @email, @full_name, @role, @member_type, @student_code, @class_name, @department, @department_position';

        const result = await request.query(`
                INSERT INTO users (
                    ${insertColumns}
                )
                OUTPUT INSERTED.*
                VALUES (
                    ${insertValues}
                )
            `);

        res.status(201).json(mapUserRole(result.recordset[0]));
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: err.message });
    }
};

// PUT /api/users/:id - Cập nhật user
exports.updateUser = async (req, res) => {
    try {
        const {
            email,
            full_name,
            avatar_url,
            role,
            is_active,
            member_type,
            student_code,
            class_name,
            department,
            department_position
        } = req.body;
        const pool = await getConnection();
        const hasAvatarColumn = await hasUserAvatarColumn(pool);
        const request = pool.request()
            .input('id', sql.Int, req.params.id)
            .input('email', sql.NVarChar, email)
            .input('full_name', sql.NVarChar, full_name)
            .input('role', sql.NVarChar, sanitizeIncomingRole(role))
            .input('is_active', sql.Bit, is_active)
            .input('member_type', sql.NVarChar, member_type)
            .input('student_code', sql.NVarChar, student_code || null)
            .input('class_name', sql.NVarChar, class_name || null)
            .input('department', sql.NVarChar, department || null)
            .input('department_position', sql.NVarChar, sanitizeDepartmentPosition(department_position));

        if (hasAvatarColumn) {
            request.input('avatar_url', sql.NVarChar, avatar_url || null);
        }

        const avatarUpdatePart = hasAvatarColumn ? 'avatar_url = @avatar_url,' : '';
        const result = await request.query(`
                UPDATE users 
                SET email = @email, full_name = @full_name, ${avatarUpdatePart} role = @role, 
                    is_active = @is_active,
                    member_type = @member_type,
                    student_code = @student_code,
                    class_name = @class_name,
                    department = @department,
                    department_position = @department_position,
                    updated_at = GETDATE()
                OUTPUT INSERTED.*
                WHERE id = @id
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'User không tồn tại' });
        }
        res.json(mapUserRole(result.recordset[0]));
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: err.message });
    }
};

// DELETE /api/users/:id - Xóa user
exports.deleteUser = async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('DELETE FROM users WHERE id = @id');

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'User không tồn tại' });
        }
        res.json({ message: 'Xóa user thành công' });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: err.message });
    }
};
