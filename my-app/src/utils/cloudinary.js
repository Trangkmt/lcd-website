/**
 * Trích xuất public_id từ URL Cloudinary.
 * public_id sẽ là "folder/image_name"
 */
export function getCloudinaryPublicId(url) {
    if (!url || typeof url !== 'string') return null;

    // Kiểm tra xem đó có phải là URL Cloudinary không
    if (!url.includes('res.cloudinary.com')) return null;

    try {
        const parts = url.split('/');
        const uploadIndex = parts.indexOf('upload');
        if (uploadIndex === -1) return null;

        // public_id bắt đầu sau version (v12345678) hoặc ngay sau 'upload' nếu không có version
        let publicIdParts = parts.slice(uploadIndex + 1);
        
        // Nếu phần đầu tiên bắt đầu bằng 'v' và theo sau là các chữ số, đó là version
        if (publicIdParts[0] && /^v\d+$/.test(publicIdParts[0])) {
            publicIdParts = publicIdParts.slice(1);
        }

        const publicIdWithExtension = publicIdParts.join('/');
        
        // Loại bỏ extension
        const lastDotIndex = publicIdWithExtension.lastIndexOf('.');
        if (lastDotIndex === -1) return publicIdWithExtension;
        
        return publicIdWithExtension.substring(0, lastDotIndex);
    } catch (err) {
        console.error('Error parsing Cloudinary URL:', err);
        return null;
    }
}
