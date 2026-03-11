const { getConnection } = require('../database/connection-sqlserver.js');
const sql = require('mssql');

// GET /api/news - Lấy danh sách tin tức
exports.getAllNews = async (req, res) => {
    try {
        const { category_id, category_slug, is_featured, year, limit = 50, offset = 0, include_unpublished } = req.query;
        const pool = await getConnection();

        let query = `
            SELECT 
                n.id, n.title, n.slug, n.summary, n.content, n.thumbnail,
                n.view_count, n.is_featured, n.is_published, n.published_at,
                n.created_at, n.updated_at, n.author_id,
                c.name as category_name, c.slug as category_slug,
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

        if (year) {
            query += ' AND YEAR(n.created_at) = @year';
            request.input('year', sql.Int, parseInt(year));
        }

        if (is_featured) {
            query += ' AND n.is_featured = @is_featured';
            request.input('is_featured', sql.Bit, is_featured === 'true' ? 1 : 0);
        }

        query += ' ORDER BY n.created_at DESC';
        query += ' OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY';

        request.input('offset', sql.Int, parseInt(offset));
        request.input('limit', sql.Int, parseInt(limit));

        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: err.message });
    }
};

// GET /api/news/:id - Lấy tin tức theo ID
exports.getNewsById = async (req, res) => {
    try {
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

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Tin tức không tồn tại' });
        }

        // Tăng view count
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('UPDATE news SET view_count = view_count + 1 WHERE id = @id');

        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: err.message });
    }
};

// GET /api/news/slug/:slug - Lấy tin tức theo slug
exports.getNewsBySlug = async (req, res) => {
    try {
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

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Tin tức không tồn tại' });
        }

        // Tăng view count
        await pool.request()
            .input('slug', sql.NVarChar, req.params.slug)
            .query('UPDATE news SET view_count = view_count + 1 WHERE slug = @slug');

        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: err.message });
    }
};

// POST /api/news - Tạo tin tức mới
exports.createNews = async (req, res) => {
    try {
        const { title, slug, summary, content, thumbnail, category_id, author_id, is_featured, is_published } = req.body;

        if (!title || !slug) {
            return res.status(400).json({ error: 'Title và slug là bắt buộc' });
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

        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: err.message });
    }
};

// PUT /api/news/:id - Cập nhật tin tức
exports.updateNews = async (req, res) => {
    try {
        const { title, slug, summary, content, thumbnail, category_id, author_id, is_featured, is_published } = req.body;
        const pool = await getConnection();

        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('title', sql.NVarChar, title)
            .input('slug', sql.NVarChar, slug)
            .input('summary', sql.NVarChar, summary)
            .input('content', sql.NVarChar, content)
            .input('thumbnail', sql.NVarChar, thumbnail)
            .input('category_id', sql.Int, category_id || null)
            .input('author_id', sql.Int, author_id || null)
            .input('is_featured', sql.Bit, is_featured)
            .input('is_published', sql.Bit, is_published)
            .query(`
                UPDATE news 
                SET title = @title, slug = @slug, summary = @summary, content = @content,
                    thumbnail = @thumbnail, category_id = @category_id, author_id = @author_id,
                    is_featured = @is_featured, is_published = @is_published,
                    updated_at = GETDATE()
                OUTPUT INSERTED.*
                WHERE id = @id
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Tin tức không tồn tại' });
        }
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: err.message });
    }
};

// DELETE /api/news/:id - Xóa tin tức
exports.deleteNews = async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('DELETE FROM news WHERE id = @id');

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Tin tức không tồn tại' });
        }
        res.json({ message: 'Xóa tin tức thành công' });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: err.message });
    }
};
