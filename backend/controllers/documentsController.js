const { getConnection } = require('../database/connection-sqlserver.js');
const sql = require('mssql');

// GET /api/documents - Lấy danh sách tài liệu
exports.getAllDocuments = async (req, res) => {
    try {
        const { category_id, is_public, limit = 50, offset = 0 } = req.query;
        const pool = await getConnection();

        let query = `
            SELECT 
                d.id, d.title, d.description, d.file_name, d.file_path,
                d.file_size, d.file_type, d.download_count, d.is_public,
                d.created_at, d.updated_at,
                c.name as category_name,
                u.full_name as uploaded_by_name
            FROM documents d
            LEFT JOIN categories c ON d.category_id = c.id
            LEFT JOIN users u ON d.uploaded_by = u.id
            WHERE 1=1
        `;

        const request = pool.request();

        if (category_id) {
            query += ' AND d.category_id = @category_id';
            request.input('category_id', sql.Int, category_id);
        }

        if (is_public !== undefined) {
            query += ' AND d.is_public = @is_public';
            request.input('is_public', sql.Bit, is_public === 'true' ? 1 : 0);
        }

        query += ' ORDER BY d.created_at DESC';
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

// GET /api/documents/:id - Lấy tài liệu theo ID
exports.getDocumentById = async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query(`
                SELECT 
                    d.*,
                    c.name as category_name,
                    u.full_name as uploaded_by_name
                FROM documents d
                LEFT JOIN categories c ON d.category_id = c.id
                LEFT JOIN users u ON d.uploaded_by = u.id
                WHERE d.id = @id
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Tài liệu không tồn tại' });
        }
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: err.message });
    }
};

// POST /api/documents - Tạo tài liệu mới
exports.createDocument = async (req, res) => {
    try {
        const { title, description, file_name, file_path, file_size, file_type, category_id, uploaded_by, is_public } = req.body;

        if (!title || !file_name || !file_path) {
            return res.status(400).json({ error: 'Title, file_name và file_path là bắt buộc' });
        }

        const pool = await getConnection();
        const result = await pool.request()
            .input('title', sql.NVarChar, title)
            .input('description', sql.NVarChar, description || null)
            .input('file_name', sql.NVarChar, file_name)
            .input('file_path', sql.NVarChar, file_path)
            .input('file_size', sql.BigInt, file_size || null)
            .input('file_type', sql.NVarChar, file_type || null)
            .input('category_id', sql.Int, category_id || null)
            .input('uploaded_by', sql.Int, uploaded_by || null)
            .input('is_public', sql.Bit, is_public !== undefined ? is_public : 1)
            .query(`
                INSERT INTO documents (title, description, file_name, file_path, file_size, file_type, category_id, uploaded_by, is_public)
                OUTPUT INSERTED.*
                VALUES (@title, @description, @file_name, @file_path, @file_size, @file_type, @category_id, @uploaded_by, @is_public)
            `);

        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: err.message });
    }
};

// PUT /api/documents/:id - Cập nhật tài liệu
exports.updateDocument = async (req, res) => {
    try {
        const { title, description, file_name, file_path, file_size, file_type, category_id, is_public } = req.body;
        const pool = await getConnection();

        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('title', sql.NVarChar, title)
            .input('description', sql.NVarChar, description)
            .input('file_name', sql.NVarChar, file_name)
            .input('file_path', sql.NVarChar, file_path)
            .input('file_size', sql.BigInt, file_size)
            .input('file_type', sql.NVarChar, file_type)
            .input('category_id', sql.Int, category_id)
            .input('is_public', sql.Bit, is_public)
            .query(`
                UPDATE documents 
                SET title = @title, description = @description, file_name = @file_name,
                    file_path = @file_path, file_size = @file_size, file_type = @file_type,
                    category_id = @category_id, is_public = @is_public,
                    updated_at = GETDATE()
                OUTPUT INSERTED.*
                WHERE id = @id
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Tài liệu không tồn tại' });
        }
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: err.message });
    }
};

// POST /api/documents/:id/download - Tăng download count
exports.incrementDownload = async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query(`
                UPDATE documents 
                SET download_count = download_count + 1
                OUTPUT INSERTED.*
                WHERE id = @id
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Tài liệu không tồn tại' });
        }
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: err.message });
    }
};

// DELETE /api/documents/:id - Xóa tài liệu
exports.deleteDocument = async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('DELETE FROM documents WHERE id = @id');

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Tài liệu không tồn tại' });
        }
        res.json({ message: 'Xóa tài liệu thành công' });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: err.message });
    }
};
