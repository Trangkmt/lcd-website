/**
 * Extracts the public_id from a Cloudinary URL.
 * Cloudinary URLs typically look like: 
 * https://res.cloudinary.com/cloud_name/image/upload/v12345678/folder/image_name.jpg
 * The public_id would be "folder/image_name"
 */
export function getCloudinaryPublicId(url) {
    if (!url || typeof url !== 'string') return null;

    // Check if it's a Cloudinary URL
    if (!url.includes('res.cloudinary.com')) return null;

    try {
        const parts = url.split('/');
        const uploadIndex = parts.indexOf('upload');
        if (uploadIndex === -1) return null;

        // The publicId starts after version (v12345678) or right after 'upload' if no version
        let publicIdParts = parts.slice(uploadIndex + 1);
        
        // If the first part starts with 'v' and is followed by digits, it's the version part
        if (publicIdParts[0] && /^v\d+$/.test(publicIdParts[0])) {
            publicIdParts = publicIdParts.slice(1);
        }

        const publicIdWithExtension = publicIdParts.join('/');
        
        // Remove extension
        const lastDotIndex = publicIdWithExtension.lastIndexOf('.');
        if (lastDotIndex === -1) return publicIdWithExtension;
        
        return publicIdWithExtension.substring(0, lastDotIndex);
    } catch (err) {
        console.error('Error parsing Cloudinary URL:', err);
        return null;
    }
}
