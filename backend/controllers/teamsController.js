const { getConnection, sql } = require('../database/connection-sqlserver.js');
const {
    withErrorHandling,
    sendBadRequest,
    sendNotFound,
    getRecordOrNull,
    hasAffectedRows,
} = require('./controllerUtils');

// GET /api/teams - Lấy danh sách các ban/đội
exports.getAllTeams = withErrorHandling(async (req, res) => {
    const pool = await getConnection();
    const result = await pool.request().query(`
        SELECT 
            id, name, name_abbr, description, display_order
        FROM teams
        ORDER BY display_order, name
    `);
    res.json(result.recordset);
});

// GET /api/teams/:id - Lấy thông tin ban theo ID
exports.getTeamById = withErrorHandling(async (req, res) => {
    const pool = await getConnection();
    const result = await pool.request()
        .input('id', sql.Int, req.params.id)
        .query(`
            SELECT *
            FROM teams
            WHERE id = @id
        `);

    const team = getRecordOrNull(result);
    if (!team) {
        return sendNotFound(res, 'Ban không tồn tại');
    }

    res.json(team);
});

// POST /api/teams - Tạo ban mới
exports.createTeam = withErrorHandling(async (req, res) => {
    const { name, name_abbr, description, display_order } = req.body;

    if (!name) {
        return sendBadRequest(res, 'Tên ban là bắt buộc');
    }

    const pool = await getConnection();
    const result = await pool.request()
        .input('name', sql.NVarChar, name)
        .input('name_abbr', sql.NVarChar, name_abbr || null)
        .input('description', sql.NVarChar, description || null)
        .input('display_order', sql.Int, display_order || 0)
        .query(`
            INSERT INTO teams (name, name_abbr, description, display_order)
            OUTPUT INSERTED.*
            VALUES (@name, @name_abbr, @description, @display_order)
        `);

    res.status(201).json(getRecordOrNull(result));
});

// PUT /api/teams/:id - Cập nhật thông tin ban
exports.updateTeam = withErrorHandling(async (req, res) => {
    const { name, name_abbr, description, display_order } = req.body;
    const pool = await getConnection();

    const result = await pool.request()
        .input('id', sql.Int, req.params.id)
        .input('name', sql.NVarChar, name)
        .input('name_abbr', sql.NVarChar, name_abbr)
        .input('description', sql.NVarChar, description)
        .input('display_order', sql.Int, display_order)
        .query(`
            UPDATE teams 
            SET name = @name, name_abbr = @name_abbr, description = @description,
                display_order = @display_order
            OUTPUT INSERTED.*
            WHERE id = @id
        `);

    const team = getRecordOrNull(result);
    if (!team) {
        return sendNotFound(res, 'Ban không tồn tại');
    }

    res.json(team);
});

// DELETE /api/teams/:id - Xóa ban
exports.deleteTeam = withErrorHandling(async (req, res) => {
    const pool = await getConnection();
    
    // Kiểm tra xem có user nào đang thuộc ban này không trước khi xóa
    const checkUser = await pool.request()
        .input('team_id', sql.Int, req.params.id)
        .query('SELECT COUNT(*) as count FROM user_teams WHERE team_id = @team_id');
        
    if (checkUser.recordset[0].count > 0) {
        return sendBadRequest(res, 'Không thể xóa ban đang có thành viên. Vui lòng chuyển thành viên sang ban khác trước.');
    }

    const result = await pool.request()
        .input('id', sql.Int, req.params.id)
        .query('DELETE FROM teams WHERE id = @id');

    if (!hasAffectedRows(result)) {
        return sendNotFound(res, 'Ban không tồn tại');
    }

    res.json({ message: 'Xóa ban thành công' });
});
