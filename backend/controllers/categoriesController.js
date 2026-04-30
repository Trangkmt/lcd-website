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
        const normalizedPageType = String(page_type).trim().toLowerCase();
        request.input('page_type', sql.NVarChar, normalizedPageType);

        if (normalizedPageType === 'activity_annual' || normalizedPageType === 'activity_non_annual') {
            whereClause += " AND LOWER(c.page_type) IN (@page_type, 'activity')";
        } else {
            whereClause += ' AND LOWER(c.page_type) = @page_type';
        }
    }
    const result = await request.query(`
            SELECT 
                c.*, 
                pc.name as parent_name,
                (SELECT COUNT(*) FROM categories sc WHERE sc.parent_id = c.id) as subcategories_count
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
                SELECT 
                    c.*, 
                    pc.name as parent_name,
                    (SELECT COUNT(*) FROM categories sc WHERE sc.parent_id = c.id) as subcategories_count
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

// GET /api/categories/slug/:slug - Lấy category theo slug
exports.getCategoryBySlug = withErrorHandling(async (req, res) => {
    const pool = await getConnection();
    const result = await pool.request()
        .input('slug', sql.NVarChar, req.params.slug)
        .query(`
                SELECT 
                    c.*, 
                    pc.name as parent_name,
                    (SELECT COUNT(*) FROM categories sc WHERE sc.parent_id = c.id) as subcategories_count
                FROM categories c
                LEFT JOIN categories pc ON c.parent_id = pc.id
                WHERE c.slug = @slug
                  AND c.is_active = 1
            `);

    const category = getRecordOrNull(result);
    if (!category) {
        return sendNotFound(res, 'Category không tồn tại');
    }
    res.json(category);
});

// POST /api/categories - Tạo category mới
exports.createCategory = withErrorHandling(async (req, res) => {
    const { name, slug, description, intro_image, parent_id, page_type, display_order } = req.body;

    if (!name || !slug) {
        return sendBadRequest(res, 'Name và slug là bắt buộc');
    }


    const pool = await getConnection();
    const result = await pool.request()
        .input('name', sql.NVarChar, name)
        .input('slug', sql.NVarChar, slug)
        .input('description', sql.NVarChar, description || null)
        .input('intro_image', sql.NVarChar, intro_image || null)
        .input('parent_id', sql.Int, parent_id || null)
        .input('page_type', sql.NVarChar, page_type || 'news')
        .input('display_order', sql.Int, display_order || 0)
        .query(`
            INSERT INTO categories (name, slug, description, intro_image, parent_id, page_type, display_order)
                OUTPUT INSERTED.*
            VALUES (@name, @slug, @description, @intro_image, @parent_id, @page_type, @display_order)
            `);

    res.status(201).json(getRecordOrNull(result));
});

// PUT /api/categories/:id - Cập nhật category
exports.updateCategory = withErrorHandling(async (req, res) => {
    const { name, slug, description, intro_image, parent_id, page_type, display_order, is_active } = req.body;

    const pool = await getConnection();

    const result = await pool.request()
        .input('id', sql.Int, req.params.id)
        .input('name', sql.NVarChar, name)
        .input('slug', sql.NVarChar, slug)
        .input('description', sql.NVarChar, description)
        .input('intro_image', sql.NVarChar, intro_image || null)
        .input('parent_id', sql.Int, parent_id || null)
        .input('page_type', sql.NVarChar, page_type || 'news')
        .input('display_order', sql.Int, display_order)
        .input('is_active', sql.Bit, is_active)
        .query(`
                UPDATE categories 
            SET name = @name, slug = @slug, description = @description,
                intro_image = @intro_image,
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
    const categoryId = Number.parseInt(req.params.id, 10);

    if (!Number.isInteger(categoryId)) {
        return sendBadRequest(res, 'ID danh mục không hợp lệ');
    }

    const usageResult = await pool.request()
        .input('id', sql.Int, categoryId)
        .query(`
            SELECT
                (SELECT COUNT(*) FROM posts WHERE category_id = @id) AS posts_count,
                (SELECT COUNT(*) FROM activities WHERE category_id = @id) AS activities_count,
                (SELECT COUNT(*) FROM documents WHERE category_id = @id) AS documents_count,
                (SELECT COUNT(*) FROM categories WHERE parent_id = @id) AS child_categories_count
        `);

    const usage = getRecordOrNull(usageResult) || {};
    const postsCount = Number(usage.posts_count || 0);
    const activitiesCount = Number(usage.activities_count || 0);
    const documentsCount = Number(usage.documents_count || 0);
    const childCategoriesCount = Number(usage.child_categories_count || 0);

    if (postsCount > 0 || activitiesCount > 0 || documentsCount > 0 || childCategoriesCount > 0) {
        return res.status(409).json({
            error: 'Không thể xóa danh mục đang được liên kết với bài viết, nội dung hoặc danh mục con. Vui lòng chuyển hoặc xóa dữ liệu liên quan trước.',
            details: {
                posts: postsCount,
                activities: activitiesCount,
                documents: documentsCount,
                child_categories: childCategoriesCount,
            },
        });
    }

    let result;
    try {
        result = await pool.request()
            .input('id', sql.Int, categoryId)
            .query('DELETE FROM categories WHERE id = @id');
    } catch (err) {
        if (err && (err.code === 'ER_ROW_IS_REFERENCED_2' || err.errno === 1451)) {
            return res.status(409).json({
                error: 'Không thể xóa danh mục vì đang được liên kết với dữ liệu khác. Vui lòng chuyển hoặc xóa dữ liệu liên quan trước.',
            });
        }
        throw err;
    }

    if (!hasAffectedRows(result)) {
        return sendNotFound(res, 'Category không tồn tại');
    }
    res.json({ message: 'Xóa category thành công' });
});
