const ROLES = {
    ADMIN_FULL: 'admin_full',
    UTILITY_ONLY: 'utility_only',
    POST_AUTHOR: 'post_author',
};

function normalizeRole(role) {
    const raw = String(role || '').trim().toLowerCase();

    if (raw === ROLES.ADMIN_FULL || raw === 'admin') {
        return ROLES.ADMIN_FULL;
    }

    if (raw === ROLES.UTILITY_ONLY || raw === 'utility-only') {
        return ROLES.UTILITY_ONLY;
    }

    if (
        raw === ROLES.POST_AUTHOR
        || raw === 'post-author-own-posts'
        || raw === 'teacher'
        || raw === 'student'
        || raw === 'user'
        || raw === ''
    ) {
        return ROLES.POST_AUTHOR;
    }

    return ROLES.POST_AUTHOR;
}

module.exports = {
    ROLES,
    normalizeRole,
};
