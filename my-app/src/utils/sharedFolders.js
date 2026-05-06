export const SHARED_FOLDER_ROOT = 'lcd/images/shared-folder';

export const SHARED_FOLDERS = [
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
        // Phân tích cú pháp văn bản thuần túy
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

function getUserTeams(user) {
    if (!user || !user.teams || !Array.isArray(user.teams)) return [];
    return user.teams.map(t => normalizeSharedFolderText(t.team_id)).filter(Boolean);
}

function getUserPositionMap(user) {
    const raw = user?.team_position;
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

function folderMatchesTeam(folder, userTeams) {
    const folderTeamValues = (folder.teamValues || []).map(normalizeSharedFolderText);
    return folderTeamValues.some((teamValue) => userTeams.includes(teamValue));
}

function folderPositionsForUser(folder, user) {
    if (!user || !user.teams || !Array.isArray(user.teams)) return [];
    const folderTeamValues = (folder.teamValues || []).map(normalizeSharedFolderText);
    
    // Tìm tất cả các vị trí cho các ban khớp với teamValues của folder
    const positions = user.teams
        .filter(t => folderTeamValues.includes(normalizeSharedFolderText(t.team_id)))
        .map(t => normalizeSharedFolderText(t.team_position))
        .filter(Boolean);
        
    return positions;
}

    return parseSharedFolderList(positionMap.__all__).map(normalizeSharedFolderText).filter(Boolean);

export function canViewSharedFolder(user, folder) {
    if (!folder) return false;
    if (isAdminLike(user)) return true;

    const userTeams = getUserTeams(user);
    if (!userTeams.length) {
        return false;
    }

    return folderMatchesTeam(folder, userTeams);
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