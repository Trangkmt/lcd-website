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

// GET /api/contact - Lấy danh sách liên hệ (Lọc bỏ các liên hệ đã xóa mềm)
exports.getAllContacts = withErrorHandling(async (req, res) => {
    const { is_read, is_replied, is_deleted } = req.query;
    const pagination = parsePagination(req.query);
    const pool = await getConnection();

    let query = `
            SELECT 
                c.*,
                ur.full_name as read_by_name,
                urp.full_name as replied_by_name
            FROM contact_info c
            LEFT JOIN users ur ON c.read_by = ur.id
            LEFT JOIN users urp ON c.replied_by = urp.id
            WHERE 1=1
        `;

    const request = pool.request();

    // Mặc định chỉ lấy các liên hệ chưa bị xóa
    if (is_deleted === 'true') {
        query += ' AND c.is_deleted = 1';
    } else {
        query += ' AND c.is_deleted = 0';
    }

    if (is_read !== undefined) {
        query += ' AND c.is_read = @is_read';
        request.input('is_read', sql.Bit, is_read === 'true' ? 1 : 0);
    }

    if (is_replied !== undefined) {
        query += ' AND c.is_replied = @is_replied';
        request.input('is_replied', sql.Bit, is_replied === 'true' ? 1 : 0);
    }

    query += ' ORDER BY c.created_at DESC';
    query = applyPagination({ request, sql, query, pagination });

    const result = await request.query(query);
    res.json(result.recordset);
});

// GET /api/contact/:id - Lấy liên hệ theo ID
exports.getContactById = withErrorHandling(async (req, res) => {
    const pool = await getConnection();
    const result = await pool.request()
        .input('id', sql.Int, req.params.id)
        .query(`
            SELECT 
                c.*,
                ur.full_name as read_by_name,
                urp.full_name as replied_by_name,
                ud.full_name as deleted_by_name
            FROM contact_info c
            LEFT JOIN users ur ON c.read_by = ur.id
            LEFT JOIN users urp ON c.replied_by = urp.id
            LEFT JOIN users ud ON c.deleted_by = ud.id
            WHERE c.id = @id
        `);

    const contact = getRecordOrNull(result);
    if (!contact) {
        return sendNotFound(res, 'Liên hệ không tồn tại');
    }

    // Nếu người quản trị xem, đánh dấu đã đọc và ghi nhận người đọc
    if (req.authUser && contact.is_read === 0) {
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('read_by', sql.Int, req.authUser.id)
            .query('UPDATE contact_info SET is_read = 1, read_by = @read_by WHERE id = @id');
    }

    res.json(contact);
});

// GET /api/contact/stats - Thống kê liên hệ
exports.getContactStats = withErrorHandling(async (req, res) => {
    const pool = await getConnection();
    const result = await pool.request().query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN is_read = 0 AND is_deleted = 0 THEN 1 ELSE 0 END) as unread,
                SUM(CASE WHEN is_replied = 0 AND is_deleted = 0 THEN 1 ELSE 0 END) as unreplied,
                SUM(CASE WHEN is_replied = 1 AND is_deleted = 0 THEN 1 ELSE 0 END) as replied,
                SUM(CASE WHEN is_deleted = 1 THEN 1 ELSE 0 END) as deleted
            FROM contact_info
            WHERE is_deleted = 0 OR 1=1 -- Thống kê trên toàn bộ (có thể lọc theo is_deleted tùy nhu cầu)
        `);

    res.json(getRecordOrNull(result));
});

// POST /api/contact - Tạo liên hệ mới (Từ công chúng)
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
        .input('read_by', sql.Int, req.authUser?.id || null)
        .query(`
                UPDATE contact_info 
                SET is_read = 1, read_by = @read_by
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
        .input('replied_by', sql.Int, req.authUser?.id || null)
        .query(`
                UPDATE contact_info 
                SET is_replied = 1, replied_at = GETDATE(), replied_by = @replied_by
                OUTPUT INSERTED.*
                WHERE id = @id
            `);

    const contact = getRecordOrNull(result);
    if (!contact) {
        return sendNotFound(res, 'Liên hệ không tồn tại');
    }
    res.json(contact);
});

// DELETE /api/contact/:id - Xóa liên hệ (Xóa mềm)
exports.deleteContact = withErrorHandling(async (req, res) => {
    const pool = await getConnection();
    const { hard_delete } = req.query;

    if (hard_delete === 'true') {
        // Xóa vĩnh viễn (Chỉ dành cho Super Admin nếu cần thiết)
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('DELETE FROM contact_info WHERE id = @id');
            
        if (!hasAffectedRows(result)) {
            return sendNotFound(res, 'Liên hệ không tồn tại');
        }
        return res.json({ message: 'Đã xóa vĩnh viễn liên hệ' });
    }

    // Xóa mềm
    const result = await pool.request()
        .input('id', sql.Int, req.params.id)
        .input('deleted_by', sql.Int, req.authUser?.id || null)
        .query(`
            UPDATE contact_info 
            SET is_deleted = 1, deleted_by = @deleted_by, deleted_at = GETDATE()
            WHERE id = @id
        `);

    if (!hasAffectedRows(result)) {
        return sendNotFound(res, 'Liên hệ không tồn tại');
    }
    res.json({ message: 'Đã chuyển liên hệ vào thùng rác' });
});
