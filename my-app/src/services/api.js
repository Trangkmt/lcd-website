const API_BASE = '/api';
const ADMIN_TOKEN_KEY = 'admin_auth_token';
const ADMIN_AUTH_KEY = 'admin_auth_user';

async function handleResponse(res) {
    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));

        if (res.status === 401) {
            localStorage.removeItem(ADMIN_TOKEN_KEY);
            localStorage.removeItem(ADMIN_AUTH_KEY);
        }

        throw new Error(err.error || res.statusText);
    }
    return res.json();
}

function apiFetch(url, options = {}) {
    const { body, ...rest } = options;
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    return fetch(`${API_BASE}${url}`, {
        headers,
        body: body ? JSON.stringify(body) : undefined,
        ...rest,
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

export const uploadsAPI = {
    uploadImage: (fileData) => apiFetch('/uploads/image', { method: 'POST', body: { fileData } }),
};
