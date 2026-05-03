const SHARED_FOLDER_ROOT = 'lcd/images/shared-folder';

const SHARED_FOLDERS = [
    {
        id: 'bch',
        name: 'Ban Chấp Hành',
        code: 'BCH',
        teamValues: [1],
        managerPositions: ['bí thư', 'phó bí thư'],
        description: 'Tài liệu điều hành, kế hoạch tổng và biên bản họp liên tịch.',
    },
    {
        id: 'vt',
        name: 'Ban Văn Thể',
        code: 'VT',
        teamValues: [2],
        managerPositions: ['trưởng ban', 'phó ban'],
        description: 'Kịch bản văn nghệ, lịch tập luyện và kế hoạch phong trào thể thao.',
    },
    {
        id: 'dn',
        name: 'Ban Đối Ngoại',
        code: 'ĐN',
        teamValues: [5],
        managerPositions: ['trưởng ban', 'phó ban'],
        description: 'Hồ sơ đối tác, mẫu thư ngỏ và proposal tài trợ.',
    },
    {
        id: 'tcsk',
        name: 'Ban Tổ Chức Sự Kiện',
        code: 'TCSK',
        teamValues: [4],
        managerPositions: ['trưởng ban', 'phó ban'],
        description: 'Run sheet, phân công nhân sự và tài liệu vận hành sự kiện.',
    },
    {
        id: 'ttkt',
        name: 'Ban Truyền Thông Kỹ Thuật',
        code: 'TTKT',
        teamValues: [3],
        managerPositions: ['trưởng ban', 'phó ban'],
        description: 'Media kit, guideline thiết kế và tài nguyên truyền thông số.',
    },
    {
        id: 'ctd-ptd',
        name: 'Ban Công Tác Đoàn và Phát Triển Đảng',
        code: 'CTD & PTD',
        teamValues: [6],
        managerPositions: ['trưởng ban', 'phó ban'],
        description: 'Mẫu biểu đoàn vụ, hồ sơ đoàn viên và tài liệu phát triển đảng.',
    },
    {
        id: 'general',
        name: 'Thư mục chung',
        code: 'CHUNG',
        teamValues: [],
        managerPositions: ['bí thư', 'phó bí thư', 'trưởng ban', 'phó ban'],
        description: 'Tài liệu dùng chung cho toàn bộ các ban và thành viên.',
    },
];

function normalizeText(value) {
    return String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
}

function parseFlexibleList(value) {
    if (value === null || value === undefined || value === '') {
        return [];
    }

    if (Array.isArray(value)) {
        return value.flatMap((item) => parseFlexibleList(item));
    }

    if (typeof value === 'object') {
        return Object.values(value).flatMap((item) => parseFlexibleList(item));
    }

    const text = String(value).trim();
    if (!text) return [];

    try {
        const parsed = JSON.parse(text);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            return Object.values(parsed).flatMap((item) => parseFlexibleList(item));
        }
        if (Array.isArray(parsed)) {
            return parsed.flatMap((item) => parseFlexibleList(item));
        }
    } catch {
        // fall back to plain text parsing
    }

    return text
        .split(/[\n,;|]/g)
        .map((item) => item.trim())
        .filter(Boolean);
}

function resolveSharedFolder(folderId) {
    const normalizedFolderId = normalizeText(folderId);
    return SHARED_FOLDERS.find((folder) => normalizeText(folder.id) === normalizedFolderId) || null;
}

function getSharedFolderPath(folderId) {
    return `${SHARED_FOLDER_ROOT}/${folderId}`;
}

module.exports = {
    SHARED_FOLDER_ROOT,
    SHARED_FOLDERS,
    getSharedFolderPath,
    normalizeText,
    parseFlexibleList,
    resolveSharedFolder,
};