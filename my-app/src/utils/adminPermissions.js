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

export function canAccessAdminPath(user, pathname) {
    if (!user?.id) return false;
    if (isAdminFull(user)) return true;

    if (pathname === '/admin') {
        return true;
    }

    if (pathname.startsWith('/admin/account')) {
        return true;
    }

    if (pathname.startsWith('/admin/utilities')) {
        return true;
    }

    if (isUtilityOnly(user)) {
        return pathname.startsWith('/admin/utilities');
    }

    if (isContactManager(user)) {
        return pathname.startsWith('/admin/contacts') || pathname.startsWith('/admin/utilities');
    }

    if (isPostAuthor(user)) {
        return pathname.startsWith('/admin/posts');
    }

    return false;
}

export function getDefaultAdminPath(user) {
    if (isAdminFull(user)) return '/admin';
    if (isUtilityOnly(user)) return '/admin/utilities';
    if (isContactManager(user)) return '/admin/contacts';
    if (isPostAuthor(user)) return '/admin/posts';
    return '/admin/login';
}

export function canMutatePost(user, post) {
    if (isAdminFull(user)) return true;
    if (isPostAuthor(user)) {
        if (!post) return true;
        return Number(post.author_id) === Number(user?.id);
    }
    return false;
}

export function canPublishPost(user) {
    return isAdminFull(user);
}
