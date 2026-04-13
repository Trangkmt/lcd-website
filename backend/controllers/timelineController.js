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

const ANNUAL_EVENT_TYPE = 'annual';

function parseMonth(value) {
    const month = parseInteger(value, 0);
    if (month < 1 || month > 12) {
        return null;
    }
    return month;
}

function parseIsPublished(value, fallback = true) {
    if (value === undefined || value === null || value === '') {
        return fallback;
    }

    if (value === true || value === 1 || value === '1' || value === 'true') {
        return 1;
    }

    if (value === false || value === 0 || value === '0' || value === 'false') {
        return 0;
    }

    return fallback ? 1 : 0;
}

// GET /api/timeline - Public timeline events
exports.getPublicTimeline = withErrorHandling(async (req, res) => {
    const pagination = parsePagination(req.query, 100, 500);
    const pool = await getConnection();
    const request = pool.request();

    let query = `
        SELECT
            t.id, t.month, t.event_name, t.summary, t.sort_order,
            t.is_published, t.created_at, t.updated_at,
            u.full_name as created_by_name
        FROM timeline_events t
        LEFT JOIN users u ON t.created_by = u.id
        WHERE t.is_published = 1
          AND t.event_type = @event_type
    `;

    request.input('event_type', sql.NVarChar, ANNUAL_EVENT_TYPE);

    if (req.query.month !== undefined) {
        const month = parseMonth(req.query.month);
        if (!month) {
            return sendBadRequest(res, 'Tháng không hợp lệ, cần nằm trong khoảng 1-12');
        }
        request.input('month', sql.Int, month);
        query += ' AND t.month = @month';
    }

    query += ' ORDER BY t.month ASC, t.sort_order ASC, t.created_at ASC';
    query = applyPagination({ request, sql, query, pagination });

    const result = await request.query(query);
    res.json(result.recordset);
});

// GET /api/timeline/admin - Admin list with drafts
exports.getAdminTimeline = withErrorHandling(async (req, res) => {
    const pagination = parsePagination(req.query, 200, 500);
    const pool = await getConnection();
    const request = pool.request();

    let query = `
        SELECT
            t.id, t.month, t.event_name, t.summary, t.sort_order,
            t.is_published, t.created_by, t.created_at, t.updated_at,
            u.full_name as created_by_name
        FROM timeline_events t
        LEFT JOIN users u ON t.created_by = u.id
        WHERE t.event_type = @event_type
    `;

    request.input('event_type', sql.NVarChar, ANNUAL_EVENT_TYPE);

    if (req.query.month !== undefined && req.query.month !== '') {
        const month = parseMonth(req.query.month);
        if (!month) {
            return sendBadRequest(res, 'Tháng không hợp lệ, cần nằm trong khoảng 1-12');
        }
        request.input('month', sql.Int, month);
        query += ' AND t.month = @month';
    }

    if (req.query.is_published !== undefined && req.query.is_published !== '') {
        const isPublished = parseIsPublished(req.query.is_published, true);
        request.input('is_published', sql.Bit, isPublished);
        query += ' AND t.is_published = @is_published';
    }

    query += ' ORDER BY t.month ASC, t.sort_order ASC, t.created_at ASC';
    query = applyPagination({ request, sql, query, pagination });

    const result = await request.query(query);
    res.json(result.recordset);
});

// GET /api/timeline/:id
exports.getTimelineById = withErrorHandling(async (req, res) => {
    const pool = await getConnection();
    const result = await pool.request()
        .input('id', sql.Int, req.params.id)
        .input('event_type', sql.NVarChar, ANNUAL_EVENT_TYPE)
        .query(`
            SELECT
                t.id, t.month, t.event_name, t.summary, t.sort_order,
                t.is_published, t.created_by, t.created_at, t.updated_at,
                u.full_name as created_by_name
            FROM timeline_events t
            LEFT JOIN users u ON t.created_by = u.id
            WHERE t.id = @id
              AND t.event_type = @event_type
        `);

    const timelineEvent = getRecordOrNull(result);
    if (!timelineEvent) {
        return sendNotFound(res, 'Sự kiện timeline không tồn tại');
    }

    res.json(timelineEvent);
});

// POST /api/timeline
exports.createTimelineEvent = withErrorHandling(async (req, res) => {
    const { month, event_name, summary, sort_order, is_published } = req.body;

    const normalizedMonth = parseMonth(month);
    if (!normalizedMonth) {
        return sendBadRequest(res, 'Tháng không hợp lệ, cần nằm trong khoảng 1-12');
    }

    if (!event_name || !String(event_name).trim()) {
        return sendBadRequest(res, 'Tên sự kiện là bắt buộc');
    }

    if (String(event_name).trim().length > 20) {
        return sendBadRequest(res, 'Tên sự kiện không được vượt quá 20 ký tự');
    }

    const pool = await getConnection();
    const result = await pool.request()
        .input('event_type', sql.NVarChar, ANNUAL_EVENT_TYPE)
        .input('month', sql.Int, normalizedMonth)
        .input('event_name', sql.NVarChar, String(event_name).trim())
        .input('summary', sql.NVarChar, summary || null)
        .input('sort_order', sql.Int, parseInteger(sort_order, 0))
        .input('is_published', sql.Bit, parseIsPublished(is_published, true))
        .input('created_by', sql.Int, req.authUser?.id || null)
        .query(`
            INSERT INTO timeline_events (event_type, month, event_name, summary, sort_order, is_published, created_by)
            OUTPUT INSERTED.*
            VALUES (@event_type, @month, @event_name, @summary, @sort_order, @is_published, @created_by)
        `);

    res.status(201).json(getRecordOrNull(result));
});

// PUT /api/timeline/:id
exports.updateTimelineEvent = withErrorHandling(async (req, res) => {
    const { month, event_name, summary, sort_order, is_published } = req.body;

    const normalizedMonth = parseMonth(month);
    if (!normalizedMonth) {
        return sendBadRequest(res, 'Tháng không hợp lệ, cần nằm trong khoảng 1-12');
    }

    if (!event_name || !String(event_name).trim()) {
        return sendBadRequest(res, 'Tên sự kiện là bắt buộc');
    }

    if (String(event_name).trim().length > 20) {
        return sendBadRequest(res, 'Tên sự kiện không được vượt quá 20 ký tự');
    }

    const pool = await getConnection();
    const result = await pool.request()
        .input('id', sql.Int, req.params.id)
        .input('event_type', sql.NVarChar, ANNUAL_EVENT_TYPE)
        .input('month', sql.Int, normalizedMonth)
        .input('event_name', sql.NVarChar, String(event_name).trim())
        .input('summary', sql.NVarChar, summary || null)
        .input('sort_order', sql.Int, parseInteger(sort_order, 0))
        .input('is_published', sql.Bit, parseIsPublished(is_published, true))
        .query(`
            UPDATE timeline_events
            SET event_type = @event_type,
                month = @month,
                event_name = @event_name,
                summary = @summary,
                sort_order = @sort_order,
                is_published = @is_published,
                updated_at = GETDATE()
            OUTPUT INSERTED.*
            WHERE id = @id
              AND event_type = @event_type
        `);

    const timelineEvent = getRecordOrNull(result);
    if (!timelineEvent) {
        return sendNotFound(res, 'Sự kiện timeline không tồn tại');
    }

    res.json(timelineEvent);
});

// DELETE /api/timeline/:id
exports.deleteTimelineEvent = withErrorHandling(async (req, res) => {
    const pool = await getConnection();
    const result = await pool.request()
        .input('id', sql.Int, req.params.id)
        .input('event_type', sql.NVarChar, ANNUAL_EVENT_TYPE)
        .query('DELETE FROM timeline_events WHERE id = @id AND event_type = @event_type');

    if (!hasAffectedRows(result)) {
        return sendNotFound(res, 'Sự kiện timeline không tồn tại');
    }

    res.json({ message: 'Xóa sự kiện timeline thành công' });
});
