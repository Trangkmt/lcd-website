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
const { ROLES, normalizeRole } = require('../config/roles');
const { isAdmin } = require('../middleware/authMiddleware');

function isPostAuthor(user) {
    return normalizeRole(user?.role) === ROLES.POST_AUTHOR;
}

async function getPostById(pool, id) {
    const result = await pool.request()
        .input('id', sql.Int, id)
        .query('SELECT id, author_id, is_published FROM posts WHERE id = @id LIMIT 1');
    return getRecordOrNull(result);
}

// GET /api/posts - Lấy danh sách bài viết
exports.getAllPosts = withErrorHandling(async (req, res) => {
    const { category_id, category_slug, page_type, is_featured, year, include_unpublished, search } = req.query;
    const pagination = parsePagination(req.query);
    const pool = await getConnection();

    let query = `
            SELECT 
                n.id, n.title, n.slug, n.summary, n.content, n.thumbnail,
                n.view_count, n.is_featured, n.is_published, n.published_at,
                n.created_at, n.updated_at, n.author_id, n.category_id,
                c.name as category_name, c.slug as category_slug, c.page_type,
                u.full_name as author_name
            FROM posts n
            LEFT JOIN categories c ON n.category_id = c.id
            LEFT JOIN users u ON n.author_id = u.id
            WHERE 1=1
        `;

    const currentUser = req.authUser;
    const includeUnpublished = include_unpublished === 'true';

    if (!includeUnpublished) {
        query += ' AND n.is_published = 1';
    } else if (isPostAuthor(currentUser)) {
        query += ' AND (n.is_published = 1 OR n.author_id = @request_user_id)';
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
    
    if (search) {
        query += ' AND (n.title LIKE @search OR n.summary LIKE @search OR n.content LIKE @search)';
        request.input('search', sql.NVarChar, `%${search}%`);
    }

    if (includeUnpublished && isPostAuthor(currentUser)) {
        request.input('request_user_id', sql.Int, currentUser.id);
    }

    query += ' ORDER BY n.created_at DESC';
    query = applyPagination({ request, sql, query, pagination });

    const result = await request.query(query);
    res.json(result.recordset);
});

// GET /api/posts/:id - Lấy bài viết theo ID
exports.getPostById = withErrorHandling(async (req, res) => {
    const pool = await getConnection();
    const result = await pool.request()
        .input('id', sql.Int, req.params.id)
        .query(`
                SELECT 
                    n.*,
                    c.name as category_name, c.slug as category_slug,
                    u.full_name as author_name, u.email as author_email
                FROM posts n
                LEFT JOIN categories c ON n.category_id = c.id
                LEFT JOIN users u ON n.author_id = u.id
                WHERE n.id = @id
            `);

    const post = getRecordOrNull(result);
    if (!post) {
        return sendNotFound(res, 'Bài viết không tồn tại');
    }

    await pool.request()
        .input('id', sql.Int, req.params.id)
        .query('UPDATE posts SET view_count = view_count + 1 WHERE id = @id');

    res.json(post);
});

// GET /api/posts/slug/:slug - Lấy bài viết theo slug
exports.getPostBySlug = withErrorHandling(async (req, res) => {
    const pool = await getConnection();
    const result = await pool.request()
        .input('slug', sql.NVarChar, req.params.slug)
        .query(`
                SELECT 
                    n.*,
                    c.name as category_name, c.slug as category_slug,
                    u.full_name as author_name
                FROM posts n
                LEFT JOIN categories c ON n.category_id = c.id
                LEFT JOIN users u ON n.author_id = u.id
                WHERE n.slug = @slug AND n.is_published = 1
            `);

    const post = getRecordOrNull(result);
    if (!post) {
        return sendNotFound(res, 'Bài viết không tồn tại');
    }

    await pool.request()
        .input('slug', sql.NVarChar, req.params.slug)
        .query('UPDATE posts SET view_count = view_count + 1 WHERE slug = @slug');

    res.json(post);
});

// POST /api/posts - Tạo bài viết mới
exports.createPost = withErrorHandling(async (req, res) => {
    const currentUser = req.authUser;
    if (!currentUser) {
        return res.status(401).json({ error: 'Bạn chưa đăng nhập' });
    }

    const admin = isAdmin(currentUser);
    const author = isPostAuthor(currentUser);
    if (!admin && !author) {
        return res.status(403).json({ error: 'Bạn không có quyền tạo bài viết' });
    }

    const { title, slug, summary, content, thumbnail, category_id, author_id, is_featured, is_published } = req.body;

    if (!title || !slug) {
        return sendBadRequest(res, 'Title và slug là bắt buộc');
    }

    const finalAuthorId = admin
        ? (author_id || currentUser.id || null)
        : currentUser.id;
    const finalIsPublished = admin ? !!is_published : false;

    const pool = await getConnection();
    const result = await pool.request()
        .input('title', sql.NVarChar, title)
        .input('slug', sql.NVarChar, slug)
        .input('summary', sql.NVarChar, summary || null)
        .input('content', sql.NVarChar, content || null)
        .input('thumbnail', sql.NVarChar, thumbnail || null)
        .input('category_id', sql.Int, category_id || null)
        .input('author_id', sql.Int, finalAuthorId)
        .input('is_featured', sql.Bit, is_featured || 0)
        .input('is_published', sql.Bit, finalIsPublished || 0)
        .input('published_at', sql.DateTime, finalIsPublished ? new Date() : null)
        .query(`
                INSERT INTO posts (title, slug, summary, content, thumbnail, category_id, author_id, is_featured, is_published, published_at)
                OUTPUT INSERTED.*
                VALUES (@title, @slug, @summary, @content, @thumbnail, @category_id, @author_id, @is_featured, @is_published, @published_at)
            `);

    res.status(201).json(getRecordOrNull(result));
});

// PUT /api/posts/:id - Cập nhật bài viết
exports.updatePost = withErrorHandling(async (req, res) => {
    const currentUser = req.authUser;
    if (!currentUser) {
        return res.status(401).json({ error: 'Bạn chưa đăng nhập' });
    }

    const admin = isAdmin(currentUser);
    const author = isPostAuthor(currentUser);
    if (!admin && !author) {
        return res.status(403).json({ error: 'Bạn không có quyền cập nhật bài viết' });
    }

    const { title, slug, summary, content, thumbnail, category_id, author_id, is_featured, is_published } = req.body;
    const pool = await getConnection();

    const existingPost = await getPostById(pool, req.params.id);
    if (!existingPost) {
        return sendNotFound(res, 'Bài viết không tồn tại');
    }

    if (!admin && existingPost.author_id !== currentUser.id) {
        return res.status(403).json({ error: 'Bạn chỉ có thể sửa bài viết của mình' });
    }

    const nextIsPublished = admin ? !!is_published : !!existingPost.is_published;
    const nextAuthorId = admin ? (author_id ?? null) : existingPost.author_id;

    const request = pool.request()
        .input('id', sql.Int, req.params.id)
        .input('title', sql.NVarChar, title)
        .input('slug', sql.NVarChar, slug)
        .input('summary', sql.NVarChar, summary ?? null)
        .input('content', sql.NVarChar, content ?? null)
        .input('thumbnail', sql.NVarChar, thumbnail ?? null)
        .input('author_id', sql.Int, nextAuthorId)
        .input('is_featured', sql.Bit, is_featured ? 1 : 0)
        .input('is_published', sql.Bit, nextIsPublished ? 1 : 0);

    let categoryUpdate;
    if (category_id !== undefined && category_id !== null && category_id !== '') {
        request.input('category_id', sql.Int, category_id);
        categoryUpdate = 'category_id = @category_id,';
    } else if (category_id === null) {
        request.input('category_id', sql.Int, null);
        categoryUpdate = 'category_id = @category_id,';
    } else {
        categoryUpdate = ''; 
    }

    const result = await request.query(`
                UPDATE posts 
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
        return sendNotFound(res, 'Bài viết không tồn tại');
    }
    res.json(post);
});

// DELETE /api/posts/:id - Xóa bài viết
exports.deletePost = withErrorHandling(async (req, res) => {
    const currentUser = req.authUser;
    if (!currentUser) {
        return res.status(401).json({ error: 'Bạn chưa đăng nhập' });
    }

    const admin = isAdmin(currentUser);
    const author = isPostAuthor(currentUser);
    if (!admin && !author) {
        return res.status(403).json({ error: 'Bạn không có quyền xóa bài viết' });
    }

    const pool = await getConnection();

    if (!admin) {
        const existingPost = await getPostById(pool, req.params.id);
        if (!existingPost) {
            return sendNotFound(res, 'Bài viết không tồn tại');
        }
        if (existingPost.author_id !== currentUser.id) {
            return res.status(403).json({ error: 'Bạn chỉ có thể xóa bài viết của mình' });
        }
    }

    const result = await pool.request()
        .input('id', sql.Int, req.params.id)
        .query('DELETE FROM posts WHERE id = @id');

    if (!hasAffectedRows(result)) {
        return sendNotFound(res, 'Bài viết không tồn tại');
    }
    res.json({ message: 'Xóa bài viết thành công' });
});
