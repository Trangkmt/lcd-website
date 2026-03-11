const { getConnection } = require('../database/connection-sqlserver.js');
const sql = require('mssql');

// GET /api/categories - Lấy danh sách categories
exports.getAllCategories = async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query(`
            SELECT c.*, pc.name as parent_name
            FROM categories c
            LEFT JOIN categories pc ON c.parent_id = pc.id
            WHERE c.is_active = 1
            ORDER BY c.display_order, c.name
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: err.message });
    }
};

// GET /api/categories/:id - Lấy category theo ID
exports.getCategoryById = async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query(`
                SELECT c.*, pc.name as parent_name
                FROM categories c
                LEFT JOIN categories pc ON c.parent_id = pc.id
                WHERE c.id = @id
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Category không tồn tại' });
        }
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: err.message });
    }
};

// POST /api/categories - Tạo category mới
exports.createCategory = async (req, res) => {
    try {
        const { name, slug, description, parent_id, display_order } = req.body;

        if (!name || !slug) {
            return res.status(400).json({ error: 'Name và slug là bắt buộc' });
        }

        const pool = await getConnection();
        const result = await pool.request()
            .input('name', sql.NVarChar, name)
            .input('slug', sql.NVarChar, slug)
            .input('description', sql.NVarChar, description || null)
            .input('parent_id', sql.Int, parent_id || null)
            .input('display_order', sql.Int, display_order || 0)
            .query(`
                INSERT INTO categories (name, slug, description, parent_id, display_order)
                OUTPUT INSERTED.*
                VALUES (@name, @slug, @description, @parent_id, @display_order)
            `);

        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: err.message });
    }
};

// PUT /api/categories/:id - Cập nhật category
exports.updateCategory = async (req, res) => {
    try {
        const { name, slug, description, parent_id, display_order, is_active } = req.body;
        const pool = await getConnection();

        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('name', sql.NVarChar, name)
            .input('slug', sql.NVarChar, slug)
            .input('description', sql.NVarChar, description)
            .input('parent_id', sql.Int, parent_id || null)
            .input('display_order', sql.Int, display_order)
            .input('is_active', sql.Bit, is_active)
            .query(`
                UPDATE categories 
                SET name = @name, slug = @slug, description = @description,
                    parent_id = @parent_id, display_order = @display_order,
                    is_active = @is_active, updated_at = GETDATE()
                OUTPUT INSERTED.*
                WHERE id = @id
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Category không tồn tại' });
        }
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: err.message });
    }
};

// DELETE /api/categories/:id - Xóa category
exports.deleteCategory = async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('DELETE FROM categories WHERE id = @id');

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Category không tồn tại' });
        }
        res.json({ message: 'Xóa category thành công' });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: err.message });
    }
};
