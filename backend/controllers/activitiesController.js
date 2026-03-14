const { getConnection, sql } = require('../database/connection-sqlserver.js');
const {
    withErrorHandling,
    sendBadRequest,
    sendNotFound,
    parseInteger,
    parsePagination,
    applyPagination,
    getRecordOrNull,
    hasAffectedRows
} = require('./controllerUtils');

// GET /api/activities - Lấy danh sách hoạt động
exports.getAllActivities = withErrorHandling(async (req, res) => {
    const { category_id, is_featured, year } = req.query;
    const pagination = parsePagination(req.query);
    const pool = await getConnection();

    let query = `
            SELECT 
                a.id, a.title, a.slug, a.description, a.content,
                a.location, a.start_date, a.end_date, a.thumbnail, a.images,
                a.organizer, a.view_count, a.is_featured, a.is_published,
                a.created_at, a.updated_at,
                c.name as category_name,
                u.full_name as created_by_name
            FROM activities a
            LEFT JOIN categories c ON a.category_id = c.id
            LEFT JOIN users u ON a.created_by = u.id
            WHERE a.is_published = 1
        `;

    const request = pool.request();

    if (category_id) {
        query += ' AND a.category_id = @category_id';
        request.input('category_id', sql.Int, category_id);
    }

    if (is_featured) {
        query += ' AND a.is_featured = @is_featured';
        request.input('is_featured', sql.Bit, is_featured === 'true' ? 1 : 0);
    }

    if (year) {
        query += ' AND YEAR(a.start_date) = @year';
        request.input('year', sql.Int, parseInteger(year, 0));
    }

    query += ' ORDER BY a.start_date DESC';
    query = applyPagination({ request, sql, query, pagination });

    const result = await request.query(query);
    res.json(result.recordset);
});

// GET /api/activities/:id - Lấy hoạt động theo ID
exports.getActivityById = withErrorHandling(async (req, res) => {
    const pool = await getConnection();
    const result = await pool.request()
        .input('id', sql.Int, req.params.id)
        .query(`
                SELECT 
                    a.*,
                    c.name as category_name,
                    u.full_name as created_by_name
                FROM activities a
                LEFT JOIN categories c ON a.category_id = c.id
                LEFT JOIN users u ON a.created_by = u.id
                WHERE a.id = @id
            `);

    const activity = getRecordOrNull(result);
    if (!activity) {
        return sendNotFound(res, 'Hoạt động không tồn tại');
    }

    await pool.request()
        .input('id', sql.Int, req.params.id)
        .query('UPDATE activities SET view_count = view_count + 1 WHERE id = @id');

    res.json(activity);
});

// GET /api/activities/slug/:slug - Lấy hoạt động theo slug
exports.getActivityBySlug = withErrorHandling(async (req, res) => {
    const pool = await getConnection();
    const result = await pool.request()
        .input('slug', sql.NVarChar, req.params.slug)
        .query(`
                SELECT 
                    a.*,
                    c.name as category_name,
                    u.full_name as created_by_name
                FROM activities a
                LEFT JOIN categories c ON a.category_id = c.id
                LEFT JOIN users u ON a.created_by = u.id
                WHERE a.slug = @slug AND a.is_published = 1
            `);

    const activity = getRecordOrNull(result);
    if (!activity) {
        return sendNotFound(res, 'Hoạt động không tồn tại');
    }

    await pool.request()
        .input('slug', sql.NVarChar, req.params.slug)
        .query('UPDATE activities SET view_count = view_count + 1 WHERE slug = @slug');

    res.json(activity);
});

// GET /api/activities/year/:year - Lấy hoạt động theo năm
exports.getActivitiesByYear = withErrorHandling(async (req, res) => {
    const pool = await getConnection();
    const result = await pool.request()
        .input('year', sql.Int, req.params.year)
        .query(`
                SELECT 
                    a.id, a.title, a.slug, a.description, a.location,
                    a.start_date, a.end_date, a.thumbnail, a.organizer,
                    c.name as category_name
                FROM activities a
                LEFT JOIN categories c ON a.category_id = c.id
                WHERE a.is_published = 1 AND YEAR(a.start_date) = @year
                ORDER BY a.start_date DESC
            `);

    res.json(result.recordset);
});

// POST /api/activities - Tạo hoạt động mới
exports.createActivity = withErrorHandling(async (req, res) => {
    const { title, slug, description, content, location, start_date, end_date, thumbnail, images, organizer, category_id, created_by, is_featured, is_published } = req.body;

    if (!title || !slug) {
        return sendBadRequest(res, 'Title và slug là bắt buộc');
    }

    const pool = await getConnection();
    const result = await pool.request()
        .input('title', sql.NVarChar, title)
        .input('slug', sql.NVarChar, slug)
        .input('description', sql.NVarChar, description || null)
        .input('content', sql.NVarChar, content || null)
        .input('location', sql.NVarChar, location || null)
        .input('start_date', sql.DateTime, start_date || null)
        .input('end_date', sql.DateTime, end_date || null)
        .input('thumbnail', sql.NVarChar, thumbnail || null)
        .input('images', sql.NVarChar, images || null)
        .input('organizer', sql.NVarChar, organizer || null)
        .input('category_id', sql.Int, category_id || null)
        .input('created_by', sql.Int, created_by || null)
        .input('is_featured', sql.Bit, is_featured || 0)
        .input('is_published', sql.Bit, is_published !== undefined ? is_published : 1)
        .query(`
                INSERT INTO activities (title, slug, description, content, location, start_date, end_date, thumbnail, images, organizer, category_id, created_by, is_featured, is_published)
                OUTPUT INSERTED.*
                VALUES (@title, @slug, @description, @content, @location, @start_date, @end_date, @thumbnail, @images, @organizer, @category_id, @created_by, @is_featured, @is_published)
            `);

    res.status(201).json(getRecordOrNull(result));
});

// PUT /api/activities/:id - Cập nhật hoạt động
exports.updateActivity = withErrorHandling(async (req, res) => {
    const { title, slug, description, content, location, start_date, end_date, thumbnail, images, organizer, category_id, is_featured, is_published } = req.body;
    const pool = await getConnection();

    const result = await pool.request()
        .input('id', sql.Int, req.params.id)
        .input('title', sql.NVarChar, title)
        .input('slug', sql.NVarChar, slug)
        .input('description', sql.NVarChar, description)
        .input('content', sql.NVarChar, content)
        .input('location', sql.NVarChar, location)
        .input('start_date', sql.DateTime, start_date)
        .input('end_date', sql.DateTime, end_date)
        .input('thumbnail', sql.NVarChar, thumbnail)
        .input('images', sql.NVarChar, images)
        .input('organizer', sql.NVarChar, organizer)
        .input('category_id', sql.Int, category_id)
        .input('is_featured', sql.Bit, is_featured)
        .input('is_published', sql.Bit, is_published)
        .query(`
                UPDATE activities 
                SET title = @title, slug = @slug, description = @description, content = @content,
                    location = @location, start_date = @start_date, end_date = @end_date,
                    thumbnail = @thumbnail, images = @images, organizer = @organizer,
                    category_id = @category_id, is_featured = @is_featured,
                    is_published = @is_published, updated_at = GETDATE()
                OUTPUT INSERTED.*
                WHERE id = @id
            `);

    const activity = getRecordOrNull(result);
    if (!activity) {
        return sendNotFound(res, 'Hoạt động không tồn tại');
    }
    res.json(activity);
});

// DELETE /api/activities/:id - Xóa hoạt động
exports.deleteActivity = withErrorHandling(async (req, res) => {
    const pool = await getConnection();
    const result = await pool.request()
        .input('id', sql.Int, req.params.id)
        .query('DELETE FROM activities WHERE id = @id');

    if (!hasAffectedRows(result)) {
        return sendNotFound(res, 'Hoạt động không tồn tại');
    }
    res.json({ message: 'Xóa hoạt động thành công' });
});
