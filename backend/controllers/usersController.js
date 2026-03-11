const { getConnection } = require('../database/connection-sqlserver.js');
const sql = require('mssql');

// GET /api/users - Lấy danh sách users
exports.getAllUsers = async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query(`
            SELECT id, username, email, full_name, role, is_active, created_at, updated_at
            FROM users
            ORDER BY created_at DESC
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: err.message });
    }
};

// GET /api/users/:id - Lấy user theo ID
exports.getUserById = async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('SELECT id, username, email, full_name, role, is_active, created_at, updated_at FROM users WHERE id = @id');

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'User không tồn tại' });
        }
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: err.message });
    }
};

// POST /api/users - Tạo user mới
exports.createUser = async (req, res) => {
    try {
        const { username, password, email, full_name, role } = req.body;

        if (!username || !password || !email) {
            return res.status(400).json({ error: 'Username, password và email là bắt buộc' });
        }

        const pool = await getConnection();
        const result = await pool.request()
            .input('username', sql.NVarChar, username)
            .input('password', sql.NVarChar, password) // Lưu ý: Nên hash password trước khi lưu
            .input('email', sql.NVarChar, email)
            .input('full_name', sql.NVarChar, full_name || null)
            .input('role', sql.NVarChar, role || 'user')
            .query(`
                INSERT INTO users (username, password, email, full_name, role)
                OUTPUT INSERTED.*
                VALUES (@username, @password, @email, @full_name, @role)
            `);

        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: err.message });
    }
};

// PUT /api/users/:id - Cập nhật user
exports.updateUser = async (req, res) => {
    try {
        const { email, full_name, role, is_active } = req.body;
        const pool = await getConnection();

        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('email', sql.NVarChar, email)
            .input('full_name', sql.NVarChar, full_name)
            .input('role', sql.NVarChar, role)
            .input('is_active', sql.Bit, is_active)
            .query(`
                UPDATE users 
                SET email = @email, full_name = @full_name, role = @role, 
                    is_active = @is_active, updated_at = GETDATE()
                OUTPUT INSERTED.*
                WHERE id = @id
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'User không tồn tại' });
        }
        res.json(result.recordset[0]);
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
