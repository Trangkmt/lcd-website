const { getConnection } = require('../database/connection-sqlserver.js');
const sql = require('mssql');

// GET /api/activities - Lấy danh sách hoạt động
exports.getAllActivities = async (req, res) => {
    try {
        const { category_id, is_featured, year, limit = 50, offset = 0 } = req.query;
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
            request.input('year', sql.Int, parseInt(year));
        }

        query += ' ORDER BY a.start_date DESC';
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

// GET /api/activities/:id - Lấy hoạt động theo ID
exports.getActivityById = async (req, res) => {
    try {
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

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Hoạt động không tồn tại' });
        }

        // Tăng view count
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('UPDATE activities SET view_count = view_count + 1 WHERE id = @id');

        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: err.message });
    }
};

// GET /api/activities/slug/:slug - Lấy hoạt động theo slug
exports.getActivityBySlug = async (req, res) => {
    try {
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

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Hoạt động không tồn tại' });
        }

        // Tăng view count
        await pool.request()
            .input('slug', sql.NVarChar, req.params.slug)
            .query('UPDATE activities SET view_count = view_count + 1 WHERE slug = @slug');

        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: err.message });
    }
};

// GET /api/activities/year/:year - Lấy hoạt động theo năm
exports.getActivitiesByYear = async (req, res) => {
    try {
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
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: err.message });
    }
};

// POST /api/activities - Tạo hoạt động mới
exports.createActivity = async (req, res) => {
    try {
        const { title, slug, description, content, location, start_date, end_date, thumbnail, images, organizer, category_id, created_by, is_featured, is_published } = req.body;

        if (!title || !slug) {
            return res.status(400).json({ error: 'Title và slug là bắt buộc' });
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

        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: err.message });
    }
};

// PUT /api/activities/:id - Cập nhật hoạt động
exports.updateActivity = async (req, res) => {
    try {
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

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Hoạt động không tồn tại' });
        }
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: err.message });
    }
};

// DELETE /api/activities/:id - Xóa hoạt động
exports.deleteActivity = async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('DELETE FROM activities WHERE id = @id');

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Hoạt động không tồn tại' });
        }
        res.json({ message: 'Xóa hoạt động thành công' });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: err.message });
    }
};
