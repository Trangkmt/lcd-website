const { getConnection, sql } = require('../database/connection-sqlserver.js');
const {
    withErrorHandling,
    sendBadRequest,
    sendNotFound,
    getRecordOrNull,
    hasAffectedRows
} = require('./controllerUtils');

// GET /api/categories - Lấy danh sách categories
exports.getAllCategories = withErrorHandling(async (req, res) => {
    const { page_type } = req.query;
    const pool = await getConnection();
    const request = pool.request();
    let whereClause = 'WHERE c.is_active = 1';
    if (page_type) {
        request.input('page_type', sql.NVarChar, page_type);
        whereClause += ' AND c.page_type = @page_type';
    }
    const result = await request.query(`
            SELECT c.*, pc.name as parent_name
            FROM categories c
            LEFT JOIN categories pc ON c.parent_id = pc.id
            ${whereClause}
            ORDER BY c.display_order, c.name
        `);
    res.json(result.recordset);
});

// GET /api/categories/:id - Lấy category theo ID
exports.getCategoryById = withErrorHandling(async (req, res) => {
    const pool = await getConnection();
    const result = await pool.request()
        .input('id', sql.Int, req.params.id)
        .query(`
                SELECT c.*, pc.name as parent_name
                FROM categories c
                LEFT JOIN categories pc ON c.parent_id = pc.id
                WHERE c.id = @id
            `);

    const category = getRecordOrNull(result);
    if (!category) {
        return sendNotFound(res, 'Category không tồn tại');
    }
    res.json(category);
});

// POST /api/categories - Tạo category mới
exports.createCategory = withErrorHandling(async (req, res) => {
    const { name, slug, description, parent_id, page_type, display_order } = req.body;

    if (!name || !slug) {
        return sendBadRequest(res, 'Name và slug là bắt buộc');
    }

    const pool = await getConnection();
    const result = await pool.request()
        .input('name', sql.NVarChar, name)
        .input('slug', sql.NVarChar, slug)
        .input('description', sql.NVarChar, description || null)
        .input('parent_id', sql.Int, parent_id || null)
        .input('page_type', sql.NVarChar, page_type || 'news')
        .input('display_order', sql.Int, display_order || 0)
        .query(`
                INSERT INTO categories (name, slug, description, parent_id, page_type, display_order)
                OUTPUT INSERTED.*
                VALUES (@name, @slug, @description, @parent_id, @page_type, @display_order)
            `);

    res.status(201).json(getRecordOrNull(result));
});

// PUT /api/categories/:id - Cập nhật category
exports.updateCategory = withErrorHandling(async (req, res) => {
    const { name, slug, description, parent_id, page_type, display_order, is_active } = req.body;
    const pool = await getConnection();

    const result = await pool.request()
        .input('id', sql.Int, req.params.id)
        .input('name', sql.NVarChar, name)
        .input('slug', sql.NVarChar, slug)
        .input('description', sql.NVarChar, description)
        .input('parent_id', sql.Int, parent_id || null)
        .input('page_type', sql.NVarChar, page_type || 'news')
        .input('display_order', sql.Int, display_order)
        .input('is_active', sql.Bit, is_active)
        .query(`
                UPDATE categories 
                SET name = @name, slug = @slug, description = @description,
                    parent_id = @parent_id, page_type = @page_type,
                    display_order = @display_order,
                    is_active = @is_active, updated_at = GETDATE()
                OUTPUT INSERTED.*
                WHERE id = @id
            `);

    const category = getRecordOrNull(result);
    if (!category) {
        return sendNotFound(res, 'Category không tồn tại');
    }
    res.json(category);
});

// DELETE /api/categories/:id - Xóa category
exports.deleteCategory = withErrorHandling(async (req, res) => {
    const pool = await getConnection();
    const result = await pool.request()
        .input('id', sql.Int, req.params.id)
        .query('DELETE FROM categories WHERE id = @id');

    if (!hasAffectedRows(result)) {
        return sendNotFound(res, 'Category không tồn tại');
    }
    res.json({ message: 'Xóa category thành công' });
});
