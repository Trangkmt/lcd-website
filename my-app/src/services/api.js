const API_BASE = '/api';
const ADMIN_TOKEN_KEY = 'admin_auth_token';
const ADMIN_AUTH_KEY = 'admin_auth_user';

async function parseResponseBody(res) {
    if (res.status === 204 || res.status === 205) {
        return null;
    }

    const contentType = res.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
        return res.json().catch(() => null);
    }

    return res.text().catch(() => null);
}

async function handleResponse(res) {
    const payload = await parseResponseBody(res);

    if (!res.ok) {
        const message =
            (payload && typeof payload === 'object' && (payload.error || payload.message)) ||
            (typeof payload === 'string' && payload) ||
            res.statusText;

        if (res.status === 401) {
            localStorage.removeItem(ADMIN_TOKEN_KEY);
            localStorage.removeItem(ADMIN_AUTH_KEY);
        }

        const error = new Error(message);
        error.status = res.status;
        throw error;
    }

    return payload;
}

function apiFetch(url, options = {}) {
    const { body, headers: customHeaders = {}, ...rest } = options;
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);

    const headers = {
        ...customHeaders,
    };

    if (token && !headers.Authorization) {
        headers.Authorization = `Bearer ${token}`;
    }

    let requestBody;

    if (body instanceof FormData) {
        requestBody = body;
    } else if (body !== undefined) {
        if (!headers['Content-Type']) {
            headers['Content-Type'] = 'application/json';
        }
        requestBody = typeof body === 'string' ? body : JSON.stringify(body);
    }

    return fetch(`${API_BASE}${url}`, {
        ...rest,
        headers,
        body: requestBody,
    }).then(handleResponse);
}

export const newsAPI = {
    getAll: (params = {}) => apiFetch(`/news?${new URLSearchParams(params)}`),
    getById: (id) => apiFetch(`/news/${id}`),
    create: (data) => apiFetch('/news', { method: 'POST', body: data }),
    update: (id, data) => apiFetch(`/news/${id}`, { method: 'PUT', body: data }),
    delete: (id) => apiFetch(`/news/${id}`, { method: 'DELETE' }),
};

export const usersAPI = {
    getAll: () => apiFetch('/users'),
    getById: (id) => apiFetch(`/users/${id}`),
    create: (data) => apiFetch('/users', { method: 'POST', body: data }),
    update: (id, data) => apiFetch(`/users/${id}`, { method: 'PUT', body: data }),
    delete: (id) => apiFetch(`/users/${id}`, { method: 'DELETE' }),
};

export const categoriesAPI = {
    getAll: (params = {}) => apiFetch(`/categories?${new URLSearchParams(params)}`),
    getById: (id) => apiFetch(`/categories/${id}`),
    getBySlug: (slug) => apiFetch(`/categories/slug/${slug}`),
    create: (data) => apiFetch('/categories', { method: 'POST', body: data }),
    update: (id, data) => apiFetch(`/categories/${id}`, { method: 'PUT', body: data }),
    delete: (id) => apiFetch(`/categories/${id}`, { method: 'DELETE' }),
};

export const contactAPI = {
    getAll: (params = {}) => apiFetch(`/contact?${new URLSearchParams(params)}`),
    getById: (id) => apiFetch(`/contact/${id}`),
    create: (data) => apiFetch('/contact', { method: 'POST', body: data }),
    markAsRead: (id) => apiFetch(`/contact/${id}/read`, { method: 'PUT' }),
    markAsReplied: (id) => apiFetch(`/contact/${id}/reply`, { method: 'PUT' }),
    delete: (id) => apiFetch(`/contact/${id}`, { method: 'DELETE' }),
};

export const activitiesAPI = {
    getAll: (params = {}) => apiFetch(`/activities?${new URLSearchParams(params)}`),
    getById: (id) => apiFetch(`/activities/${id}`),
    getBySlug: (slug) => apiFetch(`/activities/slug/${slug}`),
    create: (data) => apiFetch('/activities', { method: 'POST', body: data }),
    update: (id, data) => apiFetch(`/activities/${id}`, { method: 'PUT', body: data }),
    delete: (id) => apiFetch(`/activities/${id}`, { method: 'DELETE' }),
};

export const organizationsAPI = {
    getAll: () => apiFetch('/organizations'),
    getById: (id) => apiFetch(`/organizations/${id}`),
    create: (data) => apiFetch('/organizations', { method: 'POST', body: data }),
    update: (id, data) => apiFetch(`/organizations/${id}`, { method: 'PUT', body: data }),
    delete: (id) => apiFetch(`/organizations/${id}`, { method: 'DELETE' }),
};

export const authAPI = {
    login: (data) => apiFetch('/auth/login', { method: 'POST', body: data }),
};

export const aiAPI = {
    generatePost: (data) => apiFetch('/ai/generate-post', { method: 'POST', body: data }),
};

export const postTemplatesAPI = {
    getAll: (params = {}) => apiFetch(`/post-templates?${new URLSearchParams(params)}`),
    create: (data) => apiFetch('/post-templates', { method: 'POST', body: data }),
    update: (id, data) => apiFetch(`/post-templates/${id}`, { method: 'PUT', body: data }),
    delete: (id) => apiFetch(`/post-templates/${id}`, { method: 'DELETE' }),
};

export const uploadsAPI = {
    uploadImage: (fileData, folder) => apiFetch('/uploads/image', { method: 'POST', body: { fileData, folder } }),
};

export const timelineAPI = {
    getPublic: (params = {}) => apiFetch(`/timeline?${new URLSearchParams(params)}`),
    getAdmin: async (params = {}) => {
        const query = new URLSearchParams(params).toString();
        const querySuffix = query ? `?${query}` : '';

        try {
            return await apiFetch(`/timeline/admin/list${querySuffix}`);
        } catch (error) {
            // Backward compatibility for backends exposing /timeline/admin instead of /timeline/admin/list.
            if (error?.status !== 404) {
                throw error;
            }

            return apiFetch(`/timeline/admin${querySuffix}`);
        }
    },
    getById: (id) => apiFetch(`/timeline/${id}`),
    create: (data) => apiFetch('/timeline', { method: 'POST', body: data }),
    update: (id, data) => apiFetch(`/timeline/${id}`, { method: 'PUT', body: data }),
    delete: (id) => apiFetch(`/timeline/${id}`, { method: 'DELETE' }),
};
