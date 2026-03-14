const withErrorHandling = (handler) => async (req, res) => {
    try {
        await handler(req, res);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: err.message });
    }
};

const sendBadRequest = (res, message) => res.status(400).json({ error: message });

const sendNotFound = (res, message) => res.status(404).json({ error: message });

const parseInteger = (value, fallback) => {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const parsePagination = (query, defaultLimit = 50, maxLimit = 200) => {
    const rawLimit = parseInteger(query.limit, defaultLimit);
    const rawOffset = parseInteger(query.offset, 0);

    return {
        limit: Math.max(1, Math.min(rawLimit, maxLimit)),
        offset: Math.max(0, rawOffset)
    };
};

const applyPagination = ({ request, sql, query, pagination }) => {
    request.input('offset', sql.Int, pagination.offset);
    request.input('limit', sql.Int, pagination.limit);
    return `${query} OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;
};

const getRecordOrNull = (result) => {
    if (!result || !Array.isArray(result.recordset) || result.recordset.length === 0) {
        return null;
    }

    return result.recordset[0];
};

const hasAffectedRows = (result) => {
    if (!result || !Array.isArray(result.rowsAffected)) {
        return false;
    }

    return result.rowsAffected.some((count) => count > 0);
};

module.exports = {
    withErrorHandling,
    sendBadRequest,
    sendNotFound,
    parseInteger,
    parsePagination,
    applyPagination,
    getRecordOrNull,
    hasAffectedRows
};