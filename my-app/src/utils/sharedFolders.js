export const SHARED_FOLDER_ROOT = 'lcd/images/shared-folder';

export const SHARED_FOLDERS = [
    {
        id: 'bch',
        name: 'Ban Chấp Hành',
        code: 'BCH',
        departmentValues: ['ban chấp hành', 'ban chap hanh', 'bch'],
        managerPositions: ['bí thư', 'phó bí thư'],
        description: 'Tài liệu điều hành, kế hoạch tổng và biên bản họp liên tịch.',
    },
    {
        id: 'vt',
        name: 'Ban Văn Thể',
        code: 'VT',
        departmentValues: ['ban văn thể', 'ban van the', 'vt'],
        managerPositions: ['trưởng ban', 'phó ban'],
        description: 'Kịch bản văn nghệ, lịch tập luyện và kế hoạch phong trào thể thao.',
    },
    {
        id: 'dn',
        name: 'Ban Đối Ngoại',
        code: 'ĐN',
        departmentValues: ['ban đối ngoại', 'ban doi ngoai', 'dn'],
        managerPositions: ['trưởng ban', 'phó ban'],
        description: 'Hồ sơ đối tác, mẫu thư ngỏ và proposal tài trợ.',
    },
    {
        id: 'tcsk',
        name: 'Ban Tổ Chức Sự Kiện',
        code: 'TCSK',
        departmentValues: ['ban tổ chức sự kiện', 'ban to chuc su kien', 'tcsk'],
        managerPositions: ['trưởng ban', 'phó ban'],
        description: 'Run sheet, phân công nhân sự và tài liệu vận hành sự kiện.',
    },
    {
        id: 'ttkt',
        name: 'Ban Truyền Thông Kỹ Thuật',
        code: 'TTKT',
        departmentValues: ['ban truyền thông kỹ thuật', 'ban truyen thong ky thuat', 'ttkt'],
        managerPositions: ['trưởng ban', 'phó ban'],
        description: 'Media kit, guideline thiết kế và tài nguyên truyền thông số.',
    },
    {
        id: 'ctd-ptd',
        name: 'Ban Công Tác Đoàn và Phát Triển Đảng',
        code: 'CTD & PTD',
        departmentValues: ['ban công tác đoàn và phát triển đảng', 'ban cong tac doan va phat trien dang', 'ctd ptd', 'ctd-ptd'],
        managerPositions: ['trưởng ban', 'phó ban'],
        description: 'Mẫu biểu đoàn vụ, hồ sơ đoàn viên và tài liệu phát triển đảng.',
    },
];

export function normalizeSharedFolderText(value) {
    return String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
}

export function parseSharedFolderList(value) {
    if (value === null || value === undefined || value === '') {
        return [];
    }

    if (Array.isArray(value)) {
        return value.flatMap((item) => parseSharedFolderList(item));
    }

    if (typeof value === 'object') {
        return Object.values(value).flatMap((item) => parseSharedFolderList(item));
    }

    const text = String(value).trim();
    if (!text) return [];

    try {
        const parsed = JSON.parse(text);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            return Object.values(parsed).flatMap((item) => parseSharedFolderList(item));
        }
        if (Array.isArray(parsed)) {
            return parsed.flatMap((item) => parseSharedFolderList(item));
        }
    } catch {
        // fall through to plain text parsing
    }

    return text
        .split(/[\n,;|]/g)
        .map((item) => item.trim())
        .filter(Boolean);
}

export function getSharedFolderPath(folderId) {
    return `${SHARED_FOLDER_ROOT}/${folderId}`;
}

export function getSharedFolderById(folderId) {
    const normalizedFolderId = normalizeSharedFolderText(folderId);
    return SHARED_FOLDERS.find((folder) => normalizeSharedFolderText(folder.id) === normalizedFolderId) || null;
}

function isAdminLike(user) {
    const role = String(user?.role || '').trim().toLowerCase();
    return role === 'admin_full' || role === 'utility_only';
}

function getUserDepartments(user) {
    return parseSharedFolderList(user?.department)
        .map(normalizeSharedFolderText)
        .filter(Boolean);
}

function getUserPositionMap(user) {
    const raw = user?.department_position;
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
        return raw;
    }
    return { __all__: parseSharedFolderList(raw) };
}

function findMatchingObjectValue(objectValue, candidateKeys) {
    if (!objectValue || typeof objectValue !== 'object' || Array.isArray(objectValue)) {
        return undefined;
    }

    const normalizedCandidates = candidateKeys.map(normalizeSharedFolderText);
    for (const [key, value] of Object.entries(objectValue)) {
        if (normalizedCandidates.includes(normalizeSharedFolderText(key))) {
            return value;
        }
    }

    return undefined;
}

function folderMatchesDepartment(folder, userDepartments) {
    const folderDepartmentValues = (folder.departmentValues || []).map(normalizeSharedFolderText);
    return folderDepartmentValues.some((departmentValue) => userDepartments.includes(departmentValue));
}

function folderPositionsForUser(folder, user) {
    const positionMap = getUserPositionMap(user);
    const departmentKeys = [folder.id, ...(folder.departmentValues || [])].map(normalizeSharedFolderText);

    const matchedDepartmentValue = findMatchingObjectValue(positionMap, departmentKeys);
    if (matchedDepartmentValue !== undefined) {
        return parseSharedFolderList(matchedDepartmentValue).map(normalizeSharedFolderText).filter(Boolean);
    }

    return parseSharedFolderList(positionMap.__all__).map(normalizeSharedFolderText).filter(Boolean);
}

export function canViewSharedFolder(user, folder) {
    if (!folder) return false;
    if (isAdminLike(user)) return true;

    const userDepartments = getUserDepartments(user);
    if (!userDepartments.length) {
        return false;
    }

    return folderMatchesDepartment(folder, userDepartments);
}

export function canManageSharedFolder(user, folder) {
    if (!folder) return false;
    if (isAdminLike(user)) return true;

    const positions = folderPositionsForUser(folder, user);
    const allowedPositions = new Set((folder.managerPositions || ['trưởng ban', 'phó ban']).map(normalizeSharedFolderText));
    return positions.some((position) => allowedPositions.has(position));
}

export function getAccessibleSharedFolders(user) {
    return SHARED_FOLDERS.filter((folder) => canViewSharedFolder(user, folder)).map((folder) => ({
        ...folder,
        folderPath: getSharedFolderPath(folder.id),
        canManage: canManageSharedFolder(user, folder),
    }));
}

export function canAccessSharedDocs(user) {
    return getAccessibleSharedFolders(user).length > 0;
}