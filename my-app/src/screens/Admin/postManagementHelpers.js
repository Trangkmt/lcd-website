import { postsAPI, uploadsAPI } from '../../services/api';
import { canMutatePost, isAdminFull } from '../../utils/adminPermissions';
import { getCloudinaryPublicId } from '../../utils/cloudinary';

export function slugifyPostTitle(value) {
    return String(value || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
}

export function ensureCanMutatePost(user, post, deniedMessage) {
    if (canMutatePost(user, post)) {
        return true;
    }

    alert(deniedMessage);
    return false;
}

export function buildCreatePostForm(baseForm, { categoryId = '', authorId = '' } = {}) {
    return {
        ...baseForm,
        category_id: categoryId,
        author_id: authorId,
    };
}

export function buildEditPostForm(baseForm, post, { fallbackCategoryId = '', fallbackAuthorId = '' } = {}) {
    return {
        ...baseForm,
        title: post?.title || '',
        slug: post?.slug || '',
        summary: post?.summary || '',
        content: post?.content || '',
        thumbnail: post?.thumbnail || '',
        category_id: post?.category_id || fallbackCategoryId,
        author_id: post?.author_id || fallbackAuthorId,
        is_featured: !!post?.is_featured,
        is_published: !!post?.is_published,
    };
}

export function buildPostSavePayload({ form, currentUser, editingPost, defaultCategoryId = '' }) {
    const payload = {
        ...form,
        category_id: form.category_id || defaultCategoryId || null,
    };

    // Fix author_id to current user when creating
    if (!editingPost) {
        payload.author_id = currentUser?.id || payload.author_id;
    }

    if (!isAdminFull(currentUser)) {
        payload.is_published = editingPost ? !!editingPost.is_published : false;
    }

    return payload;
}

export async function deletePostWithGuard({
    id,
    list,
    currentUser,
    deniedMessage,
    confirmMessage,
    confirmFn,
    onSuccess,
}) {
    const targetPost = (list || []).find((item) => item.id === id);
    if (!ensureCanMutatePost(currentUser, targetPost, deniedMessage)) {
        return false;
    }

    if (!confirmFn) {
        throw new Error('Thiếu hàm xác nhận xóa (confirmFn).');
    }

    const confirmed = await confirmFn({
        title: 'Xác nhận xóa',
        message: confirmMessage,
        detail: 'Bài viết đã xóa sẽ không thể khôi phục.',
        variant: 'delete',
        confirmText: 'Xóa bài viết',
        confirmButtonClassName: 'btn-action btn-delete',
    });

    if (!confirmed) {
        return false;
    }

    await postsAPI.delete(id);

    // Delete thumbnail from Cloudinary if it exists
    const thumbnailPublicId = getCloudinaryPublicId(targetPost?.thumbnail);
    if (thumbnailPublicId) {
        try {
            await uploadsAPI.deleteImage(thumbnailPublicId);
        } catch (delErr) {
            console.warn('Could not delete thumbnail from Cloudinary on post deletion:', delErr);
        }
    }

    if (onSuccess) {
        await onSuccess(id);
    }
    return true;
}
