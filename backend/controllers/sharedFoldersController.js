const { v2: cloudinary } = require('cloudinary');
const { ROLES, normalizeRole } = require('../config/roles');
const {
    SHARED_FOLDERS,
    getSharedFolderPath,
    normalizeText,
    parseFlexibleList,
    resolveSharedFolder,
} = require('../config/sharedFolders');

let isConfigured = false;

function ensureCloudinaryConfig() {
    if (isConfigured) return;

    const cloudinaryUrl = (process.env.CLOUDINARY_URL || '').trim();
    const cloudName = (process.env.CLOUDINARY_CLOUD_NAME || '').trim().toLowerCase();
    const apiKey = (process.env.CLOUDINARY_API_KEY || '').trim();
    const apiSecret = (process.env.CLOUDINARY_API_SECRET || '').trim();

    if (cloudinaryUrl) {
        cloudinary.config(cloudinaryUrl);
        isConfigured = true;
        return;
    }

    if (!cloudName || !apiKey || !apiSecret) {
        throw new Error('Cloudinary chưa được cấu hình. Thiếu CLOUDINARY_URL hoặc bộ CLOUDINARY_CLOUD_NAME/CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET.');
    }

    cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
    });

    isConfigured = true;
}

function isAdminLike(user) {
    const role = normalizeRole(user?.role);
    return role === ROLES.ADMIN_FULL;
}

//hàm kiểm tra nếu user có role utility-only thì sẽ xem folder theo ban
function isUtilityOnly(user) {
    const role = normalizeRole(user?.role);
    return role === ROLES.UTILITY_ONLY;
}

function getUserDepartments(user) {
    if (!user || !user.teams || !Array.isArray(user.teams)) return [];
    return user.teams.map(t => normalizeText(t.team_id)).filter(Boolean);
}

function getUserPositionMap(user) {
    const raw = user?.team_position;

    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
        return raw;
    }

    const parsed = parseFlexibleList(raw);
    return { __all__: parsed };
}

function findMatchingObjectValue(objectValue, candidateKeys) {
    if (!objectValue || typeof objectValue !== 'object' || Array.isArray(objectValue)) {
        return undefined;
    }

    const normalizedCandidates = candidateKeys.map(normalizeText);
    for (const [key, value] of Object.entries(objectValue)) {
        if (normalizedCandidates.includes(normalizeText(key))) {
            return value;
        }
    }

    return undefined;
}

function folderMatchesDepartment(folder, userTeams) {
    const folderTeamValues = (folder.teamValues || []).map(normalizeText);
    return folderTeamValues.some((departmentValue) => userTeams.includes(departmentValue));
}

function folderPositionsForUser(folder, user) {
    if (!user || !user.teams || !Array.isArray(user.teams)) return [];
    const folderTeamValues = (folder.teamValues || []).map(normalizeText);
    
    // Find all positions for teams that match the folder's teamValues
    const positions = user.teams
        .filter(t => folderTeamValues.includes(normalizeText(t.team_id)))
        .map(t => normalizeText(t.team_position))
        .filter(Boolean);
        
    return positions;
}




function canViewFolder(user, folder) {
    // 1. CHỈ admin_full mới được xem tất cả
    if (isAdminLike(user)) {
        return true;
    }
    // 2. utility_only và các role khác đều phải check team_id
    const userTeams = getUserDepartments(user);
    console.log('User departments after parsing:', userTeams);
    // 3. Nếu user không có team_id nào -> không được xem folder nào
    if (!userTeams.length) {
        console.log('User has no departments');
        return false;
    }
    // 4. Nếu folder không có teamValues -> không cho xem (folder lỗi cấu hình)
    if (!folder.teamValues || folder.teamValues.length === 0) {
        console.log('Folder has no team_id values (misconfigured)');
        return false;
    }
    // 5. Kiểm tra team_id của user có match với folder không
    const folderTeamValues = (folder.teamValues || []).map(normalizeText);
    const hasMatch = folderTeamValues.some(folderTeam =>
        userTeams.includes(folderTeam)
    );
    return hasMatch;
}

function canManageFolder(user, folder) {
    // 1. Chỉ admin_full mới manage được tất cả
    if (isAdminLike(user)) {
        console.log('Full admin, can manage all folders');
        return true;
    }
    // 2. utility_only và các role khác phải có position phù hợp trong ban đó
    const positions = folderPositionsForUser(folder, user);
    const allowedPositions = new Set((folder.managerPositions || ['trưởng ban', 'phó ban']).map(normalizeText));
    const canManage = positions.some((position) => allowedPositions.has(position));
    return canManage;
}

function buildFileDownloadUrl(folderId, publicId) {
    return `/api/shared-folders/${encodeURIComponent(folderId)}/files/download?publicId=${encodeURIComponent(publicId)}`;
}

function isPublicIdInFolder(folder, publicId) {
    return String(publicId || '').startsWith(`${getSharedFolderPath(folder.id)}/`);
}

function mapCloudinaryFile(resource, folder) {
    const filenameBase = resource.original_filename || resource.public_id.split('/').pop() || resource.public_id;
    const downloadUrl = buildFileDownloadUrl(folder.id, resource.public_id);

    return {
        folderId: folder.id,
        folderName: folder.name,
        folderCode: folder.code,
        publicId: resource.public_id,
        fileName: resource.format && !String(filenameBase).toLowerCase().endsWith(`.${resource.format.toLowerCase()}`)
            ? `${filenameBase}.${resource.format}`
            : filenameBase,
        originalFileName: resource.original_filename || filenameBase,
        format: resource.format || '',
        resourceType: resource.resource_type || 'raw',
        size: Number(resource.bytes || 0),
        createdAt: resource.created_at,
        secureUrl: resource.secure_url,
        downloadUrl,
        canDownload: true,
    };
}

function sanitizeCloudinaryBaseName(fileName) {
    return String(fileName || 'tai-lieu')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9-_ .]/g, '')
        .trim()
        .replace(/\s+/g, '-');
}

async function getFileResource(publicId) {
    try {
        return await cloudinary.api.resource(publicId, { resource_type: 'raw' });
    } catch (error) {
        if (error?.http_code === 404) {
            return null;
        }
        throw error;
    }
}

exports.getSharedFolders = async (req, res) => {
    try {
        ensureCloudinaryConfig();

        const folders = SHARED_FOLDERS
            .filter((folder) => canViewFolder(req.authUser, folder))
            .map((folder) => ({
                id: folder.id,
                name: folder.name,
                code: folder.code,
                description: folder.description,
                folderPath: getSharedFolderPath(folder.id),
                canManage: canManageFolder(req.authUser, folder),
            }));

        res.json({ folders });
    } catch (error) {
        console.error('Error loading shared folders:', error);
        res.status(500).json({ error: error.message || 'Không thể tải danh sách folder' });
    }
};

exports.getFolderFiles = async (req, res) => {
    try {
        ensureCloudinaryConfig();

        const folder = resolveSharedFolder(req.params.folderId);
        if (!folder) {
            return res.status(404).json({ error: 'Folder không tồn tại' });
        }

        if (!canViewFolder(req.authUser, folder)) {
            return res.status(403).json({ error: 'Bạn không có quyền xem folder này' });
        }

        const prefix = `${getSharedFolderPath(folder.id)}/`;
        const result = await cloudinary.api.resources({
            resource_type: 'raw',
            type: 'upload',
            prefix,
            max_results: 100,
        });

        const files = (result.resources || [])
            .filter((resource) => String(resource.public_id || '').startsWith(prefix))
            .map((resource) => mapCloudinaryFile(resource, folder))
            .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));

        res.json({
            folder: {
                id: folder.id,
                name: folder.name,
                code: folder.code,
                description: folder.description,
                folderPath: getSharedFolderPath(folder.id),
                canManage: canManageFolder(req.authUser, folder),
            },
            files,
        });
    } catch (error) {
        console.error('Error loading folder files:', error);
        res.status(500).json({ error: error.message || 'Không thể tải danh sách file' });
    }
};

exports.uploadFolderFile = async (req, res) => {
    try {
        ensureCloudinaryConfig();

        const folder = resolveSharedFolder(req.params.folderId);
        if (!folder) {
            return res.status(404).json({ error: 'Folder không tồn tại' });
        }

        if (!canManageFolder(req.authUser, folder)) {
            return res.status(403).json({ error: 'Bạn không có quyền upload vào folder này' });
        }

        const { fileData, filePath, fileName } = req.body || {};
        const input = typeof fileData === 'string' && fileData.trim()
            ? fileData.trim()
            : (typeof filePath === 'string' ? filePath.trim() : '');

        if (!input) {
            return res.status(400).json({ error: 'Cần truyền fileData hoặc filePath' });
        }

        if (!/^data:.*;base64,/i.test(input) && !/^https?:\/\//i.test(input)) {
            return res.status(400).json({ error: 'File phải là data URL base64 hoặc URL http/https' });
        }

        const uploadName = `${sanitizeCloudinaryBaseName(fileName || 'tai-lieu')}-${Date.now()}`;
        const result = await cloudinary.uploader.upload(input, {
            folder: getSharedFolderPath(folder.id),
            public_id: uploadName,
            use_filename: true,
            unique_filename: false,
            overwrite: false,
            resource_type: 'raw',
            filename_override: fileName || uploadName,
        });

        res.status(201).json(mapCloudinaryFile(result, folder));
    } catch (error) {
        console.error('Error uploading shared folder file:', error);
        res.status(500).json({ error: error.message || 'Upload file thất bại' });
    }
};

exports.updateFolderFile = async (req, res) => {
    try {
        ensureCloudinaryConfig();

        const folder = resolveSharedFolder(req.params.folderId);
        if (!folder) {
            return res.status(404).json({ error: 'Folder không tồn tại' });
        }

        if (!canManageFolder(req.authUser, folder)) {
            return res.status(403).json({ error: 'Bạn không có quyền cập nhật file này' });
        }

        const { publicId, fileData, filePath, fileName } = req.body || {};
        const input = typeof fileData === 'string' && fileData.trim()
            ? fileData.trim()
            : (typeof filePath === 'string' ? filePath.trim() : '');

        if (!publicId) {
            return res.status(400).json({ error: 'Cần truyền publicId' });
        }

        if (!input) {
            return res.status(400).json({ error: 'Cần truyền fileData hoặc filePath để cập nhật' });
        }

        if (!isPublicIdInFolder(folder, publicId)) {
            return res.status(403).json({ error: 'File không thuộc folder này' });
        }

        const existing = await getFileResource(publicId);
        if (!existing) {
            return res.status(404).json({ error: 'File không tồn tại' });
        }

        const result = await cloudinary.uploader.upload(input, {
            public_id: publicId,
            overwrite: true,
            invalidate: true,
            resource_type: 'raw',
            filename_override: fileName || existing.original_filename || publicId.split('/').pop(),
        });

        res.json(mapCloudinaryFile(result, folder));
    } catch (error) {
        console.error('Error updating shared folder file:', error);
        res.status(500).json({ error: error.message || 'Cập nhật file thất bại' });
    }
};

exports.deleteFolderFile = async (req, res) => {
    try {
        ensureCloudinaryConfig();

        const folder = resolveSharedFolder(req.params.folderId);
        if (!folder) {
            return res.status(404).json({ error: 'Folder không tồn tại' });
        }

        if (!canManageFolder(req.authUser, folder)) {
            return res.status(403).json({ error: 'Bạn không có quyền xoá file này' });
        }

        const publicId = String(req.body?.publicId || '').trim();
        if (!publicId) {
            return res.status(400).json({ error: 'Cần truyền publicId' });
        }

        if (!isPublicIdInFolder(folder, publicId)) {
            return res.status(403).json({ error: 'File không thuộc folder này' });
        }

        const existing = await getFileResource(publicId);
        if (!existing) {
            return res.status(404).json({ error: 'File không tồn tại' });
        }

        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: 'raw',
            invalidate: true,
        });

        if (result.result !== 'ok' && result.result !== 'not found') {
            return res.status(500).json({ error: 'Không thể xoá file trên Cloudinary' });
        }

        res.json({ message: 'Xoá file thành công' });
    } catch (error) {
        console.error('Error deleting shared folder file:', error);
        res.status(500).json({ error: error.message || 'Xoá file thất bại' });
    }
};

exports.downloadFolderFile = async (req, res) => {
    try {
        ensureCloudinaryConfig();

        const folder = resolveSharedFolder(req.params.folderId);
        if (!folder) {
            return res.status(404).json({ error: 'Folder không tồn tại' });
        }

        if (!canViewFolder(req.authUser, folder)) {
            return res.status(403).json({ error: 'Bạn không có quyền tải file này' });
        }

        const publicId = String(req.query.publicId || '').trim();
        if (!publicId) {
            return res.status(400).json({ error: 'Cần truyền publicId' });
        }

        if (!isPublicIdInFolder(folder, publicId)) {
            return res.status(403).json({ error: 'File không thuộc folder này' });
        }

        const resource = await getFileResource(publicId);
        if (!resource) {
            return res.status(404).json({ error: 'File không tồn tại' });
        }

        return res.json({
            downloadUrl: resource.secure_url,
            fileName: resource.original_filename || resource.public_id.split('/').pop() || publicId,
            format: resource.format || '',
            publicId: resource.public_id,
        });
    } catch (error) {
        console.error('Error downloading shared folder file:', error);
        res.status(500).json({ error: error.message || 'Tải file thất bại' });
    }
};