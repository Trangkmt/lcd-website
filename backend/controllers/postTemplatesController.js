const { getConnection, sql } = require('../database/connection-sqlserver.js');
const {
    withErrorHandling,
    sendBadRequest,
    sendNotFound,
    getRecordOrNull,
    hasAffectedRows,
} = require('./controllerUtils');
const { ROLES, normalizeRole } = require('../config/roles');
const { isAdmin } = require('../middleware/authMiddleware');

let ensuredTemplateTable = false;

function isPostAuthor(user) {
    return normalizeRole(user?.role) === ROLES.POST_AUTHOR;
}

async function ensureTemplatesTable(pool) {
    if (ensuredTemplateTable) {
        return;
    }

    await pool.request().query(`
        CREATE TABLE IF NOT EXISTS post_templates (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            category_id INT NULL,
            title_template VARCHAR(255) NULL,
            summary_template TEXT NULL,
            content_template LONGTEXT NULL,
            is_default BOOLEAN DEFAULT FALSE,
            is_active BOOLEAN DEFAULT TRUE,
            created_by INT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
            FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
        )
    `);

    ensuredTemplateTable = true;
}

async function loadTemplateById(pool, id) {
    const result = await pool.request()
        .input('id', sql.Int, id)
        .query('SELECT * FROM post_templates WHERE id = @id LIMIT 1');
    return getRecordOrNull(result);
}

// GET /api/post-templates
exports.getAllTemplates = withErrorHandling(async (req, res) => {
    const currentUser = req.authUser;
    if (!currentUser) {
        return res.status(401).json({ error: 'Bạn chưa đăng nhập' });
    }

    const { category_id } = req.query;
    const pool = await getConnection();
    await ensureTemplatesTable(pool);

    const request = pool.request();
    let query = `
        SELECT
            t.*,
            c.name AS category_name,
            c.slug AS category_slug,
            c.page_type,
            u.full_name AS creator_name
        FROM post_templates t
        LEFT JOIN categories c ON t.category_id = c.id
        LEFT JOIN users u ON t.created_by = u.id
        WHERE t.is_active = 1
    `;

    if (category_id) {
        query += ' AND (t.category_id = @category_id OR t.category_id IS NULL)';
        request.input('category_id', sql.Int, category_id);
    }

    if (!isAdmin(currentUser)) {
        query += ' AND (t.created_by IS NULL OR t.created_by = @request_user_id OR t.is_default = 1)';
        request.input('request_user_id', sql.Int, currentUser.id);
    }

    query += ' ORDER BY t.is_default DESC, t.updated_at DESC';

    const result = await request.query(query);
    res.json(result.recordset || []);
});

// POST /api/post-templates
exports.createTemplate = withErrorHandling(async (req, res) => {
    const currentUser = req.authUser;
    if (!currentUser) {
        return res.status(401).json({ error: 'Bạn chưa đăng nhập' });
    }

    const admin = isAdmin(currentUser);
    const author = isPostAuthor(currentUser);
    if (!admin && !author) {
        return res.status(403).json({ error: 'Bạn không có quyền tạo template' });
    }

    const {
        name,
        category_id,
        title_template,
        summary_template,
        content_template,
        is_default,
    } = req.body;

    if (!name || !String(name).trim()) {
        return sendBadRequest(res, 'Tên template là bắt buộc');
    }

    const pool = await getConnection();
    await ensureTemplatesTable(pool);

    const finalIsDefault = admin ? !!is_default : false;

    if (finalIsDefault && category_id) {
        await pool.request()
            .input('category_id', sql.Int, category_id)
            .query('UPDATE post_templates SET is_default = 0 WHERE category_id = @category_id');
    }

    const result = await pool.request()
        .input('name', sql.NVarChar, String(name).trim())
        .input('category_id', sql.Int, category_id || null)
        .input('title_template', sql.NVarChar, title_template || null)
        .input('summary_template', sql.NVarChar, summary_template || null)
        .input('content_template', sql.NVarChar, content_template || null)
        .input('is_default', sql.Bit, finalIsDefault ? 1 : 0)
        .input('created_by', sql.Int, currentUser.id)
        .query(`
            INSERT INTO post_templates (
                name, category_id, title_template, summary_template, content_template, is_default, created_by
            )
            OUTPUT INSERTED.*
            VALUES (
                @name, @category_id, @title_template, @summary_template, @content_template, @is_default, @created_by
            )
        `);

    res.status(201).json(getRecordOrNull(result));
});

// PUT /api/post-templates/:id
exports.updateTemplate = withErrorHandling(async (req, res) => {
    const currentUser = req.authUser;
    if (!currentUser) {
        return res.status(401).json({ error: 'Bạn chưa đăng nhập' });
    }

    const pool = await getConnection();
    await ensureTemplatesTable(pool);

    const existingTemplate = await loadTemplateById(pool, req.params.id);
    if (!existingTemplate) {
        return sendNotFound(res, 'Template không tồn tại');
    }

    const admin = isAdmin(currentUser);
    if (!admin && Number(existingTemplate.created_by) !== Number(currentUser.id)) {
        return res.status(403).json({ error: 'Bạn chỉ có thể sửa template do mình tạo' });
    }

    const nextName = String(req.body.name || existingTemplate.name || '').trim();
    if (!nextName) {
        return sendBadRequest(res, 'Tên template là bắt buộc');
    }

    const nextCategoryId = req.body.category_id !== undefined
        ? (req.body.category_id || null)
        : existingTemplate.category_id;

    const nextIsDefault = admin
        ? (req.body.is_default !== undefined ? !!req.body.is_default : !!existingTemplate.is_default)
        : !!existingTemplate.is_default;

    if (nextIsDefault && nextCategoryId) {
        await pool.request()
            .input('category_id', sql.Int, nextCategoryId)
            .input('id', sql.Int, req.params.id)
            .query('UPDATE post_templates SET is_default = 0 WHERE category_id = @category_id AND id <> @id');
    }

    const result = await pool.request()
        .input('id', sql.Int, req.params.id)
        .input('name', sql.NVarChar, nextName)
        .input('category_id', sql.Int, nextCategoryId)
        .input('title_template', sql.NVarChar, req.body.title_template ?? existingTemplate.title_template ?? null)
        .input('summary_template', sql.NVarChar, req.body.summary_template ?? existingTemplate.summary_template ?? null)
        .input('content_template', sql.NVarChar, req.body.content_template ?? existingTemplate.content_template ?? null)
        .input('is_default', sql.Bit, nextIsDefault ? 1 : 0)
        .query(`
            UPDATE post_templates
            SET name = @name,
                category_id = @category_id,
                title_template = @title_template,
                summary_template = @summary_template,
                content_template = @content_template,
                is_default = @is_default,
                updated_at = GETDATE()
            OUTPUT INSERTED.*
            WHERE id = @id
        `);

    const template = getRecordOrNull(result);
    if (!template) {
        return sendNotFound(res, 'Template không tồn tại');
    }

    res.json(template);
});

// DELETE /api/post-templates/:id
exports.deleteTemplate = withErrorHandling(async (req, res) => {
    const currentUser = req.authUser;
    if (!currentUser) {
        return res.status(401).json({ error: 'Bạn chưa đăng nhập' });
    }

    const pool = await getConnection();
    await ensureTemplatesTable(pool);

    const existingTemplate = await loadTemplateById(pool, req.params.id);
    if (!existingTemplate) {
        return sendNotFound(res, 'Template không tồn tại');
    }

    const admin = isAdmin(currentUser);
    if (!admin && Number(existingTemplate.created_by) !== Number(currentUser.id)) {
        return res.status(403).json({ error: 'Bạn chỉ có thể xóa template do mình tạo' });
    }

    const result = await pool.request()
        .input('id', sql.Int, req.params.id)
        .query('DELETE FROM post_templates WHERE id = @id');

    if (!hasAffectedRows(result)) {
        return sendNotFound(res, 'Template không tồn tại');
    }

    res.json({ message: 'Xóa template thành công' });
});
