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

/**
 * HÀM TẠO TOKEN (CHỮ KÝ SỐ TỰ XÂY DỰNG)
 * Cơ chế: Sử dụng thuật toán HMAC-SHA256 để ký tên dữ liệu.
 * @param {number} userId - ID của người dùng từ Database
 * @returns {string} - Chuỗi Token: [Dữ liệu đã mã hóa Base64URL].[Chữ ký bảo mật]
 */
function buildAuthToken(userId) {
    // 1. Tạo Payload chứa thông tin ID người dùng và thời gian hết hạn (7 ngày)
    const payload = {
        id: Number(userId),
        exp: Date.now() + TOKEN_LIFETIME_MS,
    };
    
    // 2. Chuyển Object thành chuỗi JSON và mã hóa sang Base64URL để truyền tải an toàn
    const payloadEncoded = toBase64Url(JSON.stringify(payload));
    
    // 3. Tạo chữ ký số (Signature) bằng cách băm chuỗi trên với mã bí mật (AUTH_SECRET)
    const signature = signValue(payloadEncoded);
    
    // 4. Trả về Token hoàn chỉnh
    return `${payloadEncoded}.${signature}`;
}

/**
 * HÀM XÁC THỰC TOKEN (KIỂM TRA VÉ THẬT/GIẢ)
 * Kiểm tra tính toàn vẹn của dữ liệu và thời hạn của Token.
 * @param {string} token - Chuỗi token nhận được từ Header Authorization
 */
function verifyAuthToken(token) {
    if (!token || typeof token !== 'string') {
        return null;
    }

    // 1. Tách Token thành 2 phần: Dữ liệu (payloadEncoded) và Chữ ký (signature)
    const [payloadEncoded, signature] = token.split('.');
    if (!payloadEncoded || !signature) {
        return null;
    }

    // 2. Kiểm tra chữ ký: Lấy phần dữ liệu nhận được đi "ký lại" xem có khớp với chữ ký gửi kèm không
    const expectedSignature = signValue(payloadEncoded);
    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    // Sử dụng crypto.timingSafeEqual để chống tấn công Timing Attack (bảo mật cao)
    if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
        return null; // Chữ ký không khớp => Token bị giả mạo
    }

    try {
        // 3. Giải mã dữ liệu và kiểm tra thời gian hết hạn (Expiration)
        const payloadRaw = fromBase64Url(payloadEncoded);
        const payload = JSON.parse(payloadRaw);
        if (!payload?.id || !payload?.exp || payload.exp < Date.now()) {
            return null; // Token hết hạn hoặc ID không hợp lệ
        }
        return payload; // Token hợp lệ, trả về nội dung bên trong
    } catch {
        return null;
    }
}

/**
 * HÀM TRÍCH XUẤT TOKEN TỪ HEADER
 * Lấy chuỗi Token từ Header "Authorization: Bearer <token>"
 */
function extractBearerToken(req) {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.toLowerCase().startsWith('bearer ')) {
        return null;
    }
    // Cắt bỏ 7 ký tự đầu ("Bearer ") để lấy chuỗi Token thực tế
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

/**
 * HÀM TẢI THÔNG TIN NGƯỜI DÙNG TỪ DATABASE
 * Sau khi có ID từ Token, hàm này sẽ lấy chi tiết thông tin người dùng để gắn vào request.
 */
async function loadActiveUserById(userId) {
    const pool = await getConnection();
    const hasAvatarColumn = await hasUserAvatarColumn(pool);
    const avatarSelect = hasAvatarColumn ? 'avatar_url' : 'NULL AS avatar_url';
    
    // 1. Tải thông tin cơ bản: Tên, email, quyền, trạng thái hoạt động
    const result = await pool.request()
        .input('id', sql.Int, userId)
        .query(`
            SELECT id, username, email, full_name, ${avatarSelect}, role, member_type,
                   is_active
            FROM users
            WHERE id = @id
            LIMIT 1
        `);

    const user = result.recordset?.[0] || null;
    // Nếu không thấy user hoặc user bị khóa (is_active = 0) thì trả về null
    if (!user || !user.is_active) {
        return null;
    }

    // 2. Tải thêm thông tin về các Ban (Teams) mà người dùng này tham gia
    const teamsResult = await pool.request()
        .input('id', sql.Int, userId)
        .query(`
            SELECT ut.team_id, ut.position as team_position, t.name as team_name
            FROM user_teams ut
            JOIN teams t ON ut.team_id = t.id
            WHERE ut.user_id = @id
        `);

    // Trả về object user hoàn chỉnh bao gồm danh sách Ban
    return {
        ...user,
        role: normalizeRole(user.role),
        teams: teamsResult.recordset || [],
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

/**
 * MIDDLEWARE BẮT BUỘC ĐĂNG NHẬP (requireAuth)
 * Dùng cho các chức năng cần bảo mật (Ví dụ: Thêm bài viết, Sửa thông tin).
 */
async function requireAuth(req, res, next) {
    const token = extractBearerToken(req);
    if (!token) {
        return res.status(401).json({ error: 'Bạn chưa đăng nhập' });
    }

    // 1. Kiểm tra Token có hợp lệ và còn hạn không
    const payload = verifyAuthToken(token);
    if (!payload) {
        return res.status(401).json({ error: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn' });
    }

    try {
        // 2. Tải thông tin người dùng từ DB và gắn vào biến `req.authUser`
        const user = await loadActiveUserById(payload.id);
        if (!user) {
            return res.status(401).json({ error: 'Tài khoản không hợp lệ hoặc đã bị vô hiệu hóa' });
        }
        
        // Gắn thông tin user vào request để các hàm xử lý sau có thể dùng luôn
        req.authUser = user; 
        return next(); // Cho phép đi tiếp vào hàm xử lý API chính
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

/**
 * MIDDLEWARE KIỂM TRA QUYỀN TRUY CẬP (requireRoles)
 * Dùng để giới hạn chức năng cho một số nhóm người dùng nhất định.
 * Ví dụ: Chỉ Admin mới được vào trang Quản lý User.
 * @param {string|string[]} roles - Danh sách các quyền được phép truy cập
 */
function requireRoles(roles) {
    const roleSet = new Set(Array.isArray(roles) ? roles : [roles]);

    return (req, res, next) => {
        // Lấy quyền của người dùng hiện tại (đã được nạp từ middleware requireAuth)
        const currentRole = normalizeRole(req.authUser?.role);
        
        // Nếu quyền của họ không nằm trong danh sách được phép thì chặn lại (403 Forbidden)
        if (!roleSet.has(currentRole)) {
            return res.status(403).json({ error: 'Bạn không có quyền truy cập chức năng này' });
        }
        return next(); // Có quyền thì cho đi tiếp
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
