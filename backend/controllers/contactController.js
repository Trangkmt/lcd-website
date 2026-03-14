const { getConnection, sql } = require('../database/connection-sqlserver.js');
const {
    withErrorHandling,
    sendBadRequest,
    sendNotFound,
    parsePagination,
    applyPagination,
    getRecordOrNull,
    hasAffectedRows
} = require('./controllerUtils');

// GET /api/contact - Lấy danh sách liên hệ
exports.getAllContacts = withErrorHandling(async (req, res) => {
    const { is_read, is_replied } = req.query;
    const pagination = parsePagination(req.query);
    const pool = await getConnection();

    let query = `
            SELECT *
            FROM contact_info
            WHERE 1=1
        `;

    const request = pool.request();

    if (is_read !== undefined) {
        query += ' AND is_read = @is_read';
        request.input('is_read', sql.Bit, is_read === 'true' ? 1 : 0);
    }

    if (is_replied !== undefined) {
        query += ' AND is_replied = @is_replied';
        request.input('is_replied', sql.Bit, is_replied === 'true' ? 1 : 0);
    }

    query += ' ORDER BY created_at DESC';
    query = applyPagination({ request, sql, query, pagination });

    const result = await request.query(query);
    res.json(result.recordset);
});

// GET /api/contact/:id - Lấy liên hệ theo ID
exports.getContactById = withErrorHandling(async (req, res) => {
    const pool = await getConnection();
    const result = await pool.request()
        .input('id', sql.Int, req.params.id)
        .query('SELECT * FROM contact_info WHERE id = @id');

    const contact = getRecordOrNull(result);
    if (!contact) {
        return sendNotFound(res, 'Liên hệ không tồn tại');
    }

    await pool.request()
        .input('id', sql.Int, req.params.id)
        .query('UPDATE contact_info SET is_read = 1 WHERE id = @id AND is_read = 0');

    res.json(contact);
});

// GET /api/contact/stats - Thống kê liên hệ
exports.getContactStats = withErrorHandling(async (req, res) => {
    const pool = await getConnection();
    const result = await pool.request().query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN is_read = 0 THEN 1 ELSE 0 END) as unread,
                SUM(CASE WHEN is_replied = 0 THEN 1 ELSE 0 END) as unreplied,
                SUM(CASE WHEN is_replied = 1 THEN 1 ELSE 0 END) as replied
            FROM contact_info
        `);

    res.json(getRecordOrNull(result));
});

// POST /api/contact - Tạo liên hệ mới
exports.createContact = withErrorHandling(async (req, res) => {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
        return sendBadRequest(res, 'Name, email và message là bắt buộc');
    }

    const pool = await getConnection();
    const result = await pool.request()
        .input('name', sql.NVarChar, name)
        .input('email', sql.NVarChar, email)
        .input('phone', sql.NVarChar, phone || null)
        .input('subject', sql.NVarChar, subject || null)
        .input('message', sql.NVarChar, message)
        .query(`
                INSERT INTO contact_info (name, email, phone, subject, message)
                OUTPUT INSERTED.*
                VALUES (@name, @email, @phone, @subject, @message)
            `);

    res.status(201).json(getRecordOrNull(result));
});

// PUT /api/contact/:id/read - Đánh dấu đã đọc
exports.markAsRead = withErrorHandling(async (req, res) => {
    const pool = await getConnection();
    const result = await pool.request()
        .input('id', sql.Int, req.params.id)
        .query(`
                UPDATE contact_info 
                SET is_read = 1
                OUTPUT INSERTED.*
                WHERE id = @id
            `);

    const contact = getRecordOrNull(result);
    if (!contact) {
        return sendNotFound(res, 'Liên hệ không tồn tại');
    }
    res.json(contact);
});

// PUT /api/contact/:id/reply - Đánh dấu đã trả lời
exports.markAsReplied = withErrorHandling(async (req, res) => {
    const pool = await getConnection();
    const result = await pool.request()
        .input('id', sql.Int, req.params.id)
        .query(`
                UPDATE contact_info 
                SET is_replied = 1, replied_at = GETDATE()
                OUTPUT INSERTED.*
                WHERE id = @id
            `);

    const contact = getRecordOrNull(result);
    if (!contact) {
        return sendNotFound(res, 'Liên hệ không tồn tại');
    }
    res.json(contact);
});

// DELETE /api/contact/:id - Xóa liên hệ
exports.deleteContact = withErrorHandling(async (req, res) => {
    const pool = await getConnection();
    const result = await pool.request()
        .input('id', sql.Int, req.params.id)
        .query('DELETE FROM contact_info WHERE id = @id');

    if (!hasAffectedRows(result)) {
        return sendNotFound(res, 'Liên hệ không tồn tại');
    }
    res.json({ message: 'Xóa liên hệ thành công' });
});
