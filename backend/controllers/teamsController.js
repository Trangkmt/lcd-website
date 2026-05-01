const { getConnection, sql } = require('../database/connection-sqlserver.js');
const {
    withErrorHandling,
    sendNotFound,
    getRecordOrNull,
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
