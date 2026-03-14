const API_BASE = '/api';

async function handleResponse(res) {
    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || res.statusText);
    }
    return res.json();
}

function apiFetch(url, options = {}) {
    const { body, ...rest } = options;
    return fetch(`${API_BASE}${url}`, {
        headers: { 'Content-Type': 'application/json' },
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
    create: (data) => apiFetch('/categories', { method: 'POST', body: data }),
    update: (id, data) => apiFetch(`/categories/${id}`, { method: 'PUT', body: data }),
    delete: (id) => apiFetch(`/categories/${id}`, { method: 'DELETE' }),
};

export const contactAPI = {
    getAll: (params = {}) => apiFetch(`/contact?${new URLSearchParams(params)}`),
    getById: (id) => apiFetch(`/contact/${id}`),
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
