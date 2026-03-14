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

// GET /api/news - Lấy danh sách tin tức
exports.getAllNews = withErrorHandling(async (req, res) => {
    const { category_id, category_slug, page_type, is_featured, year, include_unpublished } = req.query;
    const pagination = parsePagination(req.query);
    const pool = await getConnection();

    let query = `
            SELECT 
                n.id, n.title, n.slug, n.summary, n.content, n.thumbnail,
                n.view_count, n.is_featured, n.is_published, n.published_at,
                n.created_at, n.updated_at, n.author_id, n.category_id,
                c.name as category_name, c.slug as category_slug, c.page_type,
                u.full_name as author_name
            FROM news n
            LEFT JOIN categories c ON n.category_id = c.id
            LEFT JOIN users u ON n.author_id = u.id
            WHERE 1=1
        `;

    if (!include_unpublished || include_unpublished !== 'true') {
        query += ' AND n.is_published = 1';
    }

    const request = pool.request();

    if (category_id) {
        query += ' AND n.category_id = @category_id';
        request.input('category_id', sql.Int, category_id);
    }

    if (category_slug) {
        query += ' AND c.slug = @category_slug';
        request.input('category_slug', sql.NVarChar, category_slug);
    }

    if (page_type) {
        query += ' AND c.page_type = @page_type';
        request.input('page_type', sql.NVarChar, page_type);
    }

    if (year) {
        query += ' AND YEAR(n.created_at) = @year';
        request.input('year', sql.Int, parseInteger(year, 0));
    }

    if (is_featured) {
        query += ' AND n.is_featured = @is_featured';
        request.input('is_featured', sql.Bit, is_featured === 'true' ? 1 : 0);
    }

    query += ' ORDER BY n.created_at DESC';
    query = applyPagination({ request, sql, query, pagination });

    const result = await request.query(query);
    res.json(result.recordset);
});

// GET /api/news/:id - Lấy tin tức theo ID
exports.getNewsById = withErrorHandling(async (req, res) => {
    const pool = await getConnection();
    const result = await pool.request()
        .input('id', sql.Int, req.params.id)
        .query(`
                SELECT 
                    n.*,
                    c.name as category_name, c.slug as category_slug,
                    u.full_name as author_name, u.email as author_email
                FROM news n
                LEFT JOIN categories c ON n.category_id = c.id
                LEFT JOIN users u ON n.author_id = u.id
                WHERE n.id = @id
            `);

    const post = getRecordOrNull(result);
    if (!post) {
        return sendNotFound(res, 'Tin tức không tồn tại');
    }

    await pool.request()
        .input('id', sql.Int, req.params.id)
        .query('UPDATE news SET view_count = view_count + 1 WHERE id = @id');

    res.json(post);
});

// GET /api/news/slug/:slug - Lấy tin tức theo slug
exports.getNewsBySlug = withErrorHandling(async (req, res) => {
    const pool = await getConnection();
    const result = await pool.request()
        .input('slug', sql.NVarChar, req.params.slug)
        .query(`
                SELECT 
                    n.*,
                    c.name as category_name, c.slug as category_slug,
                    u.full_name as author_name
                FROM news n
                LEFT JOIN categories c ON n.category_id = c.id
                LEFT JOIN users u ON n.author_id = u.id
                WHERE n.slug = @slug AND n.is_published = 1
            `);

    const post = getRecordOrNull(result);
    if (!post) {
        return sendNotFound(res, 'Tin tức không tồn tại');
    }

    await pool.request()
        .input('slug', sql.NVarChar, req.params.slug)
        .query('UPDATE news SET view_count = view_count + 1 WHERE slug = @slug');

    res.json(post);
});

// POST /api/news - Tạo tin tức mới
exports.createNews = withErrorHandling(async (req, res) => {
    const { title, slug, summary, content, thumbnail, category_id, author_id, is_featured, is_published } = req.body;

    if (!title || !slug) {
        return sendBadRequest(res, 'Title và slug là bắt buộc');
    }

    const pool = await getConnection();
    const result = await pool.request()
        .input('title', sql.NVarChar, title)
        .input('slug', sql.NVarChar, slug)
        .input('summary', sql.NVarChar, summary || null)
        .input('content', sql.NVarChar, content || null)
        .input('thumbnail', sql.NVarChar, thumbnail || null)
        .input('category_id', sql.Int, category_id || null)
        .input('author_id', sql.Int, author_id || null)
        .input('is_featured', sql.Bit, is_featured || 0)
        .input('is_published', sql.Bit, is_published || 0)
        .input('published_at', sql.DateTime, is_published ? new Date() : null)
        .query(`
                INSERT INTO news (title, slug, summary, content, thumbnail, category_id, author_id, is_featured, is_published, published_at)
                OUTPUT INSERTED.*
                VALUES (@title, @slug, @summary, @content, @thumbnail, @category_id, @author_id, @is_featured, @is_published, @published_at)
            `);

    res.status(201).json(getRecordOrNull(result));
});

// PUT /api/news/:id - Cập nhật tin tức
exports.updateNews = withErrorHandling(async (req, res) => {
    const { title, slug, summary, content, thumbnail, category_id, author_id, is_featured, is_published } = req.body;
    const pool = await getConnection();

    const request = pool.request()
        .input('id', sql.Int, req.params.id)
        .input('title', sql.NVarChar, title)
        .input('slug', sql.NVarChar, slug)
        .input('summary', sql.NVarChar, summary ?? null)
        .input('content', sql.NVarChar, content ?? null)
        .input('thumbnail', sql.NVarChar, thumbnail ?? null)
        .input('author_id', sql.Int, author_id ?? null)
        .input('is_featured', sql.Bit, is_featured ? 1 : 0)
        .input('is_published', sql.Bit, is_published ? 1 : 0);

    let categoryUpdate;
    if (category_id !== undefined && category_id !== null && category_id !== '') {
        request.input('category_id', sql.Int, category_id);
        categoryUpdate = 'category_id = @category_id,';
    } else if (category_id === null) {
        request.input('category_id', sql.Int, null);
        categoryUpdate = 'category_id = @category_id,';
    } else {
        categoryUpdate = ''; // preserve existing category_id
    }

    const result = await request.query(`
                UPDATE news 
                SET title = @title, slug = @slug, summary = @summary, content = @content,
                    thumbnail = @thumbnail, ${categoryUpdate} author_id = @author_id,
                    is_featured = @is_featured, is_published = @is_published,
                    published_at = CASE WHEN @is_published = 1 AND published_at IS NULL THEN GETDATE() ELSE published_at END,
                    updated_at = GETDATE()
                OUTPUT INSERTED.*
                WHERE id = @id
            `);

    const post = getRecordOrNull(result);
    if (!post) {
        return sendNotFound(res, 'Tin tức không tồn tại');
    }
    res.json(post);
});

// DELETE /api/news/:id - Xóa tin tức
exports.deleteNews = withErrorHandling(async (req, res) => {
    const pool = await getConnection();
    const result = await pool.request()
        .input('id', sql.Int, req.params.id)
        .query('DELETE FROM news WHERE id = @id');

    if (!hasAffectedRows(result)) {
        return sendNotFound(res, 'Tin tức không tồn tại');
    }
    res.json({ message: 'Xóa tin tức thành công' });
});
