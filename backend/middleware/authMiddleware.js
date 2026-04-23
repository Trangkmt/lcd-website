const crypto = require('crypto');
const { getConnection, sql } = require('../database/connection-sqlserver');
const { ROLES, normalizeRole } = require('../config/roles');

const AUTH_SECRET = process.env.AUTH_SECRET || 'lcd-website-change-me';
const TOKEN_LIFETIME_MS = 1000 * 60 * 60 * 24 * 7;

let hasAvatarColumnCache = null;

function toBase64Url(input) {
    return Buffer.from(input, 'utf8').toString('base64url');
}

function fromBase64Url(input) {
    return Buffer.from(input, 'base64url').toString('utf8');
}

function signValue(value) {
    return crypto.createHmac('sha256', AUTH_SECRET).update(value).digest('base64url');
}

function buildAuthToken(userId) {
    const payload = {
        id: Number(userId),
        exp: Date.now() + TOKEN_LIFETIME_MS,
    };
    const payloadEncoded = toBase64Url(JSON.stringify(payload));
    const signature = signValue(payloadEncoded);
    return `${payloadEncoded}.${signature}`;
}

function verifyAuthToken(token) {
    if (!token || typeof token !== 'string') {
        return null;
    }

    const [payloadEncoded, signature] = token.split('.');
    if (!payloadEncoded || !signature) {
        return null;
    }

    const expectedSignature = signValue(payloadEncoded);
    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);
    if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
        return null;
    }

    try {
        const payloadRaw = fromBase64Url(payloadEncoded);
        const payload = JSON.parse(payloadRaw);
        if (!payload?.id || !payload?.exp || payload.exp < Date.now()) {
            return null;
        }
        return payload;
    } catch {
        return null;
    }
}

function extractBearerToken(req) {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.toLowerCase().startsWith('bearer ')) {
        return null;
    }
    return authHeader.slice(7).trim();
}

async function hasUserAvatarColumn(pool) {
    if (hasAvatarColumnCache !== null) {
        return hasAvatarColumnCache;
    }

    const result = await pool.request().query(`
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'users'
          AND COLUMN_NAME = 'avatar_url'
        LIMIT 1
    `);
    hasAvatarColumnCache = (result.recordset || []).length > 0;
    return hasAvatarColumnCache;
}

async function loadActiveUserById(userId) {
    const pool = await getConnection();
    const hasAvatarColumn = await hasUserAvatarColumn(pool);
    const avatarSelect = hasAvatarColumn ? 'avatar_url' : 'NULL AS avatar_url';
    const result = await pool.request()
        .input('id', sql.Int, userId)
        .query(`
            SELECT id, username, email, full_name, ${avatarSelect}, role, member_type,
                   department, department_position, is_active
            FROM users
            WHERE id = @id
            LIMIT 1
        `);

    const user = result.recordset?.[0] || null;
    if (!user || !user.is_active) {
        return null;
    }

    return {
        ...user,
        role: normalizeRole(user.role),
    };
}

async function optionalAuth(req, _res, next) {
    try {
        const token = extractBearerToken(req);
        if (!token) {
            req.authUser = null;
            return next();
        }

        const payload = verifyAuthToken(token);
        if (!payload) {
            req.authUser = null;
            return next();
        }

        const user = await loadActiveUserById(payload.id);
        req.authUser = user;
        return next();
    } catch {
        req.authUser = null;
        return next();
    }
}

async function requireAuth(req, res, next) {
    const token = extractBearerToken(req);
    if (!token) {
        return res.status(401).json({ error: 'Bạn chưa đăng nhập' });
    }

    const payload = verifyAuthToken(token);
    if (!payload) {
        return res.status(401).json({ error: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn' });
    }

    try {
        const user = await loadActiveUserById(payload.id);
        if (!user) {
            return res.status(401).json({ error: 'Tài khoản không hợp lệ hoặc đã bị vô hiệu hóa' });
        }
        req.authUser = user;
        return next();
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

function requireRoles(roles) {
    const roleSet = new Set(Array.isArray(roles) ? roles : [roles]);

    return (req, res, next) => {
        const currentRole = normalizeRole(req.authUser?.role);
        if (!roleSet.has(currentRole)) {
            return res.status(403).json({ error: 'Bạn không có quyền truy cập chức năng này' });
        }
        return next();
    };
}

function isAdmin(user) {
    return normalizeRole(user?.role) === ROLES.ADMIN_FULL;
}

module.exports = {
    buildAuthToken,
    verifyAuthToken,
    requireAuth,
    optionalAuth,
    requireRoles,
    isAdmin,
};
