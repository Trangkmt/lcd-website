export const ADMIN_AUTH_KEY = 'admin_auth_user';
export const ADMIN_TOKEN_KEY = 'admin_auth_token';

export const ROLE_GROUPS = {
    ADMIN_FULL: 'admin_full',
    UTILITY_ONLY: 'utility_only',
    POST_AUTHOR: 'post_author',
    CONTACT_MANAGER: 'contact_manager',
};

export function normalizeRole(role) {
    const raw = String(role || '').trim().toLowerCase();

    if (raw === ROLE_GROUPS.ADMIN_FULL || raw === 'admin') {
        return ROLE_GROUPS.ADMIN_FULL;
    }

    if (raw === ROLE_GROUPS.UTILITY_ONLY || raw === 'utility-only') {
        return ROLE_GROUPS.UTILITY_ONLY;
    }

    if (raw === ROLE_GROUPS.CONTACT_MANAGER || raw === 'contact-manager') {
        return ROLE_GROUPS.CONTACT_MANAGER;
    }

    if (
        raw === ROLE_GROUPS.POST_AUTHOR
        || raw === 'post-author-own-posts'
        || raw === 'teacher'
        || raw === 'student'
        || raw === 'user'
        || raw === ''
    ) {
        return ROLE_GROUPS.POST_AUTHOR;
    }

    return ROLE_GROUPS.POST_AUTHOR;
}

export function getStoredAdminUser() {
    try {
        const raw = localStorage.getItem(ADMIN_AUTH_KEY);
        if (!raw) return null;
        const user = JSON.parse(raw);
        return {
            ...user,
            role: normalizeRole(user?.role),
        };
    } catch {
        return null;
    }
}

export function getStoredAdminToken() {
    return localStorage.getItem(ADMIN_TOKEN_KEY) || '';
}

export function isAdminFull(user) {
    return normalizeRole(user?.role) === ROLE_GROUPS.ADMIN_FULL;
}

export function isUtilityOnly(user) {
    return normalizeRole(user?.role) === ROLE_GROUPS.UTILITY_ONLY;
}

export function isPostAuthor(user) {
    return normalizeRole(user?.role) === ROLE_GROUPS.POST_AUTHOR;
}

export function isContactManager(user) {
    return normalizeRole(user?.role) === ROLE_GROUPS.CONTACT_MANAGER;
}

/**
 * KIỂM TRA QUYỀN TRUY CẬP ĐƯỜNG DẪN (canAccessAdminPath)
 * Đây là hàm quyết định người dùng có được vào một trang Admin cụ thể hay không.
 * @param {Object} user - Thông tin người dùng hiện tại
 * @param {string} pathname - Đường dẫn họ muốn vào (VD: /admin/members)
 */
export function canAccessAdminPath(user, pathname) {
    if (!user?.id) return false;
    
    // 1. ADMIN_FULL: Có quyền tối cao, được vào TẤT CẢ các trang.
    if (isAdminFull(user)) return true;

    // Các trang chung mà ai cũng vào được
    if (pathname === '/admin' || pathname.startsWith('/admin/account') || pathname.startsWith('/admin/utilities')) {
        return true;
    }

    // 2. UTILITY_ONLY: Chỉ được vào trang Tiện ích.
    if (isUtilityOnly(user)) {
        return pathname.startsWith('/admin/utilities');
    }

    // 3. CONTACT_MANAGER: Được vào trang quản lý Liên hệ và Tiện ích.
    if (isContactManager(user)) {
        return pathname.startsWith('/admin/contacts') || pathname.startsWith('/admin/utilities');
    }

    // 4. POST_AUTHOR: Chỉ được vào trang quản lý Bài viết.
    if (isPostAuthor(user)) {
        return pathname.startsWith('/admin/posts');
    }

    return false; // Mặc định là không có quyền
}

export function getDefaultAdminPath(user) {
    if (isAdminFull(user)) return '/admin';
    if (isUtilityOnly(user)) return '/admin/utilities';
    if (isContactManager(user)) return '/admin/contacts';
    if (isPostAuthor(user)) return '/admin/posts';
    return '/admin/login';
}

/**
 * KIỂM TRA QUYỀN CHỈNH SỬA BÀI VIẾT (canMutatePost)
 * Tác dụng: Ngăn người này sửa bài của người kia.
 */
export function canMutatePost(user, post) {
    // Admin Full: Sửa bài của bất kỳ ai cũng được.
    if (isAdminFull(user)) return true;
    
    // Tác giả (Post Author): Chỉ được sửa bài DO CHÍNH MÌNH tạo ra.
    if (isPostAuthor(user)) {
        if (!post) return true; // Đang tạo bài mới thì ok
        return Number(post.author_id) === Number(user?.id); // So sánh ID tác giả bài viết với ID người dùng hiện tại
    }
    return false;
}

export function canPublishPost(user) {
    return isAdminFull(user);
}
