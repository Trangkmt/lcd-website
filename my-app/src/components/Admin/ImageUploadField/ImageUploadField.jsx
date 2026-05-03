import React, { useRef, useState } from 'react';
import { uploadsAPI } from '../../../services/api';
import { getCloudinaryPublicId } from '../../../utils/cloudinary';
import './ImageUploadField.css';

/**
 * ImageUploadField Component
 * 
 * Props:
 * - label: Field label
 * - value: Current image URL
 * - onChange: Callback when URL changes (e.g. after upload or manual edit)
 * - folder: Cloudinary folder for uploads
 * - placeholder: Input placeholder
 * - disabled: Disable the field
 * - required: Mark as required
 */
export default function ImageUploadField({
    label,
    value,
    onChange,
    folder = 'lcd/images',
    placeholder = 'Nhập link ảnh hoặc tải lên...',
    disabled = false,
    required = false,
}) {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const readFileAsDataUrl = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error('Không thể đọc file ảnh'));
            reader.readAsDataURL(file);
        });
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Vui lòng chọn file ảnh hợp lệ.');
            return;
        }

        setUploading(true);
        try {
            // 1. Upload new image
            const fileData = await readFileAsDataUrl(file);
            const result = await uploadsAPI.uploadImage(fileData, folder);
            const newUrl = result?.secure_url || '';

            // 2. Delete old image if it was a Cloudinary image
            const oldPublicId = getCloudinaryPublicId(value);
            if (oldPublicId) {
                try {
                    await uploadsAPI.deleteImage(oldPublicId);
                } catch (delErr) {
                    console.warn('Could not delete old image from Cloudinary:', delErr);
                }
            }

            // 3. Notify parent
            onChange(newUrl);
        } catch (err) {
            alert('Upload ảnh thất bại: ' + err.message);
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const triggerFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    return (
        <div className="image-upload-field">
            {label && <label className="form-label">{label}{required && ' *'}</label>}
            <div className="image-upload-field__container">
                <input
                    type="text"
                    className="form-control"
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    disabled={disabled || uploading}
                />
                <button
                    type="button"
                    className="btn-secondary btn-upload"
                    onClick={triggerFileInput}
                    disabled={disabled || uploading}
                >
                    {uploading ? 'Đang tải...' : 'Tải lên'}
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    style={{ display: 'none' }}
                />
            </div>
        </div>
    );
}
