const { v2: cloudinary } = require('cloudinary');

let isConfigured = false;

function normalizeUploadFolder(folderInput) {
    const defaultFolder = process.env.CLOUDINARY_FOLDER || 'lcd';

    if (typeof folderInput !== 'string') {
        return defaultFolder;
    }

    const normalized = folderInput
        .trim()
        .replace(/\\+/g, '/')
        .replace(/\/+/g, '/')
        .replace(/^\/+|\/+$/g, '');

    if (!normalized) {
        return defaultFolder;
    }

    // Keep folder names predictable and safe for Cloudinary public IDs.
    if (!/^[a-zA-Z0-9_\-\/ ]+$/.test(normalized)) {
        return defaultFolder;
    }

    return normalized;
}

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

exports.uploadImage = async (req, res) => {
    try {
        ensureCloudinaryConfig();

        const { fileData, filePath, folder: requestedFolder } = req.body || {};
        const input = typeof fileData === 'string' && fileData.trim()
            ? fileData.trim()
            : (typeof filePath === 'string' ? filePath.trim() : '');

        if (!input) {
            return res.status(400).json({ error: 'Cần truyền fileData (base64 data URL) hoặc filePath.' });
        }

        const isBase64Image = input.startsWith('data:image/');
        const isHttpUrl = /^https?:\/\//i.test(input);

        if (!isBase64Image && !isHttpUrl) {
            return res.status(400).json({ error: 'fileData phải là data:image/* hoặc filePath phải là URL http/https.' });
        }

        const folder = normalizeUploadFolder(requestedFolder);
        const result = await cloudinary.uploader.upload(input, {
            folder,
            resource_type: 'image',
        });

        return res.status(201).json({
            secure_url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
        });
    } catch (err) {
        console.error('Cloudinary upload error:', err);

        if (err && err.http_code === 401 && /Invalid cloud_name/i.test(err.message || '')) {
            const loadedCloudName = (process.env.CLOUDINARY_CLOUD_NAME || '').trim();
            return res.status(500).json({
                error: 'Cloudinary cloud_name không hợp lệ. Hãy dùng đúng Cloud name trong Dashboard Cloudinary (Settings > Product Environment).',
                loaded_cloud_name: loadedCloudName || '(empty)'
            });
        }

        return res.status(500).json({ error: err.message || 'Upload ảnh thất bại' });
    }
};
