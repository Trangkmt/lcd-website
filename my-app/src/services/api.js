const API_BASE = import.meta.env.VITE_API_URL + '/api';
const ADMIN_TOKEN_KEY = 'admin_auth_token';
const ADMIN_AUTH_KEY = 'admin_auth_user';
//console.log("API_BASE:", API_BASE);

function normalizeApiErrorMessage(message) {
    if (typeof message !== 'string') {
        return message;
    }

    const lowerMessage = message.toLowerCase();

    if (
        lowerMessage.includes('high demand') ||
        lowerMessage.includes('spikes in demand') ||
        lowerMessage.includes('please try again later') ||
        lowerMessage.includes('resource_exhausted') ||
        lowerMessage.includes('quota') ||
        lowerMessage.includes('rate limit')
    ) {
        return 'AI đang quá tải hoặc bị giới hạn tạm thời. Vui lòng thử lại sau ít phút.';
    }

    if (lowerMessage.includes('cannot delete or update a parent row') && lowerMessage.includes('categories')) {
        return 'Không thể xóa danh mục vì đang liên kết với bài viết, nội dung hoặc danh mục con. Vui lòng chuyển hoặc xóa dữ liệu liên quan trước.';
    }

    return message;
}

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
        const rawMessage =
            (payload && typeof payload === 'object' && (payload.error || payload.message)) ||
            (typeof payload === 'string' && payload) ||
            res.statusText;
        const message = normalizeApiErrorMessage(rawMessage);

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

export const postsAPI = {
    getAll: (params = {}) => apiFetch(`/posts?${new URLSearchParams(params)}`),
    getById: (id) => apiFetch(`/posts/${id}`),
    create: (data) => apiFetch('/posts', { method: 'POST', body: data }),
    update: (id, data) => apiFetch(`/posts/${id}`, { method: 'PUT', body: data }),
    delete: (id) => apiFetch(`/posts/${id}`, { method: 'DELETE' }),
};

export const usersAPI = {
    getPublic: () => apiFetch('/users/public'),
    getAll: () => apiFetch('/users'),
    create: (data) => apiFetch('/users', { method: 'POST', body: data }),
    update: (id, data) => apiFetch(`/users/${id}`, { method: 'PUT', body: data }),
};

export const categoriesAPI = {
    getAll: (params = {}) => apiFetch(`/categories?${new URLSearchParams(params)}`),
    getBySlug: (slug) => apiFetch(`/categories/slug/${slug}`),
    create: (data) => apiFetch('/categories', { method: 'POST', body: data }),
    update: (id, data) => apiFetch(`/categories/${id}`, { method: 'PUT', body: data }),
    delete: (id) => apiFetch(`/categories/${id}`, { method: 'DELETE' }),
};

export const contactAPI = {
    getAll: (params = {}) => apiFetch(`/contact?${new URLSearchParams(params)}`),
    create: (data) => apiFetch('/contact', { method: 'POST', body: data }),
    markAsRead: (id) => apiFetch(`/contact/${id}/read`, { method: 'PUT' }),
    markAsReplied: (id) => apiFetch(`/contact/${id}/reply`, { method: 'PUT' }),
    delete: (id) => apiFetch(`/contact/${id}`, { method: 'DELETE' }),
};



export const teamsAPI = {
    getAll: () => apiFetch('/teams'),
    getById: (id) => apiFetch(`/teams/${id}`),
};

export const authAPI = {
    login: (data) => apiFetch('/auth/login', { method: 'POST', body: data }),
    getMyProfile: () => apiFetch('/auth/me'),
    updateMyProfile: (data) => apiFetch('/auth/me', { method: 'PUT', body: data }),
    changePassword: (data) => apiFetch('/auth/change-password', { method: 'PUT', body: data }),
};

export const aiAPI = {
    generatePost: (data) => apiFetch('/ai/generate-post', { method: 'POST', body: data }),
};

export const postTemplatesAPI = {
    getAll: (params = {}) => apiFetch(`/post-templates?${new URLSearchParams(params)}`),
    create: (data) => apiFetch('/post-templates', { method: 'POST', body: data }),
};

export const uploadsAPI = {
    uploadImage: (fileData, folder) => apiFetch('/uploads/image', { method: 'POST', body: { fileData, folder } }),
    deleteImage: (publicId) => apiFetch('/uploads/image', { method: 'DELETE', body: { publicId } }),
};

export const sharedFoldersAPI = {
    getFolders: () => apiFetch('/shared-folders'),
    getFolderFiles: (folderId) => apiFetch(`/shared-folders/${encodeURIComponent(folderId)}/files`),
    uploadFile: (folderId, data) => apiFetch(`/shared-folders/${encodeURIComponent(folderId)}/files`, { method: 'POST', body: data }),
    updateFile: (folderId, data) => apiFetch(`/shared-folders/${encodeURIComponent(folderId)}/files`, { method: 'PUT', body: data }),
    deleteFile: (folderId, publicId) => apiFetch(`/shared-folders/${encodeURIComponent(folderId)}/files`, { method: 'DELETE', body: { publicId } }),
    getDownloadInfo: (folderId, publicId) => apiFetch(`/shared-folders/${encodeURIComponent(folderId)}/files/download?publicId=${encodeURIComponent(publicId)}`),
};

export const timelineAPI = {
    getPublic: (params = {}) => apiFetch(`/timeline?${new URLSearchParams(params)}`),
    getAdmin: async (params = {}) => {
        const query = new URLSearchParams(params).toString();
        const querySuffix = query ? `?${query}` : '';

        try {
            return await apiFetch(`/timeline/admin/list${querySuffix}`);
        } catch (error) {
            //sử dụng /timeline/admin thay vì /timeline/admin/list.
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
