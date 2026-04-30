const { getConnection, sql } = require('../database/connection-sqlserver.js');
const { ROLES, normalizeRole } = require('../config/roles');

function mapUserRole(user) {
    if (!user) return user;
    return {
        ...user,
        role: normalizeRole(user.role),
        teams: user.teams || [],
    };
}

function sanitizeIncomingRole(role) {
    return normalizeRole(role || ROLES.POST_AUTHOR);
}

function sanitizeTeamPosition(value) {
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
        is_active: user.is_active,
        teams: user.teams || [],
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
            SELECT u.id, u.username, u.email, u.full_name, ${avatarSelect.replace('avatar_url', 'u.avatar_url')}, u.role, u.is_active,
                   u.member_type, u.student_code, u.class_name,
                   u.created_at, u.updated_at
            FROM users u
            ORDER BY u.created_at DESC
        `);
        const teamsResult = await pool.request().query(`
            SELECT ut.user_id, ut.team_id, ut.position as team_position, t.name as team_name
            FROM user_teams ut
            JOIN teams t ON ut.team_id = t.id
        `);
        const userTeamsMap = {};
        teamsResult.recordset.forEach(row => {
            if (!userTeamsMap[row.user_id]) userTeamsMap[row.user_id] = [];
            userTeamsMap[row.user_id].push({ team_id: row.team_id, team_name: row.team_name, team_position: row.team_position });
        });
        const users = result.recordset.map(u => ({ ...u, teams: userTeamsMap[u.id] || [] }));
        res.json(users.map(mapUserRole));
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
            SELECT u.id, u.email, u.full_name, ${avatarSelect.replace('avatar_url', 'u.avatar_url')}, u.is_active,
                   u.member_type, u.student_code, u.class_name
            FROM users u
            WHERE u.is_active = 1
            ORDER BY u.full_name ASC
        `);
        const teamsResult = await pool.request().query(`
            SELECT ut.user_id, ut.team_id, ut.position as team_position, t.name as team_name
            FROM user_teams ut
            JOIN teams t ON ut.team_id = t.id
        `);
        const userTeamsMap = {};
        teamsResult.recordset.forEach(row => {
            if (!userTeamsMap[row.user_id]) userTeamsMap[row.user_id] = [];
            userTeamsMap[row.user_id].push({ team_id: row.team_id, team_name: row.team_name, team_position: row.team_position });
        });
        const users = result.recordset.map(u => ({ ...u, teams: userTeamsMap[u.id] || [] }));
        res.json(users.map(mapPublicUser));
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
                SELECT u.id, u.username, u.email, u.full_name, ${avatarSelect.replace('avatar_url', 'u.avatar_url')}, u.role, u.is_active,
                       u.member_type, u.student_code, u.class_name,
                       u.created_at, u.updated_at
                FROM users u
                WHERE u.id = @id
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'User không tồn tại' });
        }
        
        const teamsResult = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query(`
                SELECT ut.team_id, ut.position as team_position, t.name as team_name
                FROM user_teams ut
                JOIN teams t ON ut.team_id = t.id
                WHERE ut.user_id = @id
            `);
            
        const user = { ...result.recordset[0], teams: teamsResult.recordset || [] };
        res.json(mapUserRole(user));
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
            teams
        } = req.body;

        if (!username || !password || !email) {
            return res.status(400).json({ error: 'Username, password và email là bắt buộc' });
        }

        const pool = await getConnection();
        const hasAvatarColumn = await hasUserAvatarColumn(pool);
        const request = pool.request()
            .input('username', sql.NVarChar, username)
            .input('password', sql.NVarChar, password) 
            .input('email', sql.NVarChar, email)
            .input('full_name', sql.NVarChar, full_name || null)
            .input('role', sql.NVarChar, sanitizeIncomingRole(role))
            .input('member_type', sql.NVarChar, member_type || 'student')
            .input('student_code', sql.NVarChar, student_code || null)
            .input('class_name', sql.NVarChar, class_name || null)
            ;

        if (hasAvatarColumn) {
            request.input('avatar_url', sql.NVarChar, avatar_url || null);
        }

        const insertColumns = hasAvatarColumn
            ? 'username, password, email, full_name, avatar_url, role, member_type, student_code, class_name, '
            : 'username, password, email, full_name, role, member_type, student_code, class_name, ';
        const insertValues = hasAvatarColumn
            ? '@username, @password, @email, @full_name, @avatar_url, @role, @member_type, @student_code, @class_name, '
            : '@username, @password, @email, @full_name, @role, @member_type, @student_code, @class_name, ';

        const result = await request.query(`
                INSERT INTO users (
                    ${insertColumns}
                )
                OUTPUT INSERTED.*
                VALUES (
                    ${insertValues}
                )
            `);

        const insertedUser = result.recordset[0];
        
        if (teams && Array.isArray(teams)) {
            for (const t of teams.slice(0, 2)) {
                await pool.request()
                    .input('user_id', sql.Int, insertedUser.id)
                    .input('team_id', sql.Int, t.team_id)
                    .input('position', sql.NVarChar, t.team_position)
                    .query(`INSERT INTO user_teams (user_id, team_id, position) VALUES (@user_id, @team_id, @position)`);
            }
        }
        
        const teamsResult = await pool.request()
            .input('id', sql.Int, insertedUser.id)
            .query(`
                SELECT ut.team_id, ut.position as team_position, t.name as team_name
                FROM user_teams ut
                JOIN teams t ON ut.team_id = t.id
                WHERE ut.user_id = @id
            `);
            
        insertedUser.teams = teamsResult.recordset || [];
        res.status(201).json(mapUserRole(insertedUser));
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
            teams
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
            ;

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
                    
                    updated_at = GETDATE()
                OUTPUT INSERTED.*
                WHERE id = @id
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'User không tồn tại' });
        }
        
        if (teams && Array.isArray(teams)) {
            await pool.request()
                .input('user_id', sql.Int, req.params.id)
                .query(`DELETE FROM user_teams WHERE user_id = @user_id`);
                
            for (const t of teams.slice(0, 2)) {
                await pool.request()
                    .input('user_id', sql.Int, req.params.id)
                    .input('team_id', sql.Int, t.team_id)
                    .input('position', sql.NVarChar, t.team_position)
                    .query(`INSERT INTO user_teams (user_id, team_id, position) VALUES (@user_id, @team_id, @position)`);
            }
        }
        
        const updatedResult = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query(`SELECT * FROM users WHERE id = @id`);

        const teamsResult = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query(`
                SELECT ut.team_id, ut.position as team_position, t.name as team_name
                FROM user_teams ut
                JOIN teams t ON ut.team_id = t.id
                WHERE ut.user_id = @id
            `);
            
        const user = { ...updatedResult.recordset[0], teams: teamsResult.recordset || [] };
        res.json(mapUserRole(user));
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
