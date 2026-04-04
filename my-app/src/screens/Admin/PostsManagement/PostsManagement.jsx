import React, { useMemo, useState, useEffect, useRef } from 'react';
import './PostsManagement.css';
import { newsAPI, categoriesAPI, usersAPI, aiAPI, uploadsAPI } from '../../../services/api';
import { canMutatePost, canPublishPost, getStoredAdminUser, isAdminFull } from '../../../utils/adminPermissions';
import {
    buildCreatePostForm,
    buildEditPostForm,
    buildPostSavePayload,
    deletePostWithGuard,
    ensureCanMutatePost,
    slugifyPostTitle,
} from '../postManagementHelpers';

const EMPTY_FORM = { title: '', slug: '', summary: '', content: '', thumbnail: '', category_id: '', author_id: '', is_featured: false, is_published: false };

const PAGE_TYPE_LABELS = {
    news: '📰 Tin tức',
    achievement: '🏆 Thành tích',
    activity_annual: '📅 Hoạt động thường niên',
    activity_non_annual: '🎯 Hoạt động không thường niên',
    activity: '🎯 Hoạt động',
};

function getPageTypeLabel(pageType) {
    if (!pageType) return '📁 Khác';
    return PAGE_TYPE_LABELS[pageType] || `📁 ${pageType}`;
}

export default function PostsManagement() {
    const currentUser = useMemo(() => getStoredAdminUser(), []);
    const canPublish = canPublishPost(currentUser);
    const [statusTab, setStatusTab] = useState('all');
    const [viewTab, setViewTab] = useState('list');
    const [editingPost, setEditingPost] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [searchQuery, setSearchQuery] = useState('');
    const [apiFilters, setApiFilters] = useState({ category_id: '', year: '', page_type: '', is_featured: '' });
    const [posts, setPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [aiKeywords, setAiKeywords] = useState('');
    const [aiTopic, setAiTopic] = useState('');
    const [aiGenerating, setAiGenerating] = useState(false);
    const [aiError, setAiError] = useState('');
    const [thumbnailUploading, setThumbnailUploading] = useState(false);
    const [showCatDropdown, setShowCatDropdown] = useState(false);
    const [hoveredPageType, setHoveredPageType] = useState(null);
    const catDropdownRef = useRef(null);
    const editorRef = useRef(null);
    const imageInputRef = useRef(null);
    const thumbnailInputRef = useRef(null);

    useEffect(() => {
        categoriesAPI.getAll().then(data => setCategories(Array.isArray(data) ? data : [])).catch(() => { });
        if (isAdminFull(currentUser)) {
            usersAPI.getAll().then(data => setUsers(Array.isArray(data) ? data : [])).catch(() => { });
        }
    }, []);

    useEffect(() => {
        fetchPosts(apiFilters);
    }, [apiFilters]);

    const hasActiveFilter = apiFilters.category_id || apiFilters.year || apiFilters.page_type || apiFilters.is_featured !== '';
    const resetFilters = () => setApiFilters({ category_id: '', year: '', page_type: '', is_featured: '' });
    const setApiFilter = (key, value) => setApiFilters(prev => ({ ...prev, [key]: value }));

    const availableYears = useMemo(() => {
        const years = [...new Set(posts.filter(p => p.created_at).map(p => new Date(p.created_at).getFullYear()))].sort((a, b) => b - a);
        return years;
    }, [posts]);

    useEffect(() => {
        function handleClickOutside(e) {
            if (catDropdownRef.current && !catDropdownRef.current.contains(e.target)) {
                setShowCatDropdown(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    async function fetchPosts(filters = {}) {
        setLoading(true);
        setError('');
        try {
            const params = { limit: 500, include_unpublished: true };
            if (filters.category_id) params.category_id = filters.category_id;
            if (filters.year) params.year = filters.year;
            if (filters.page_type) params.page_type = filters.page_type;
            if (filters.is_featured !== '' && filters.is_featured !== undefined) params.is_featured = filters.is_featured;
            const data = await newsAPI.getAll(params);
            setPosts(Array.isArray(data) ? data : []);
        } catch (err) {
            setError('Không thể tải danh sách bài viết: ' + err.message);
        } finally {
            setLoading(false);
        }
    }

    function openCreate() {
        setEditingPost(null);
        setForm(buildCreatePostForm(EMPTY_FORM, { authorId: currentUser?.id || '' }));
        setAiKeywords('');
        setAiTopic('');
        setAiError('');
        setViewTab('editor');
    }

    function openEdit(post) {
        if (!ensureCanMutatePost(currentUser, post, 'Bạn chỉ có thể chỉnh sửa bài viết của mình.')) {
            return;
        }

        setEditingPost(post);
        setForm(buildEditPostForm(EMPTY_FORM, post));
        setAiKeywords('');
        setAiTopic(post.title || '');
        setAiError('');
        setViewTab('editor');
    }

    function closeEditor() {
        setViewTab('list');
        setEditingPost(null);
        setForm(EMPTY_FORM);
        setAiKeywords('');
        setAiTopic('');
        setAiError('');
        setShowCatDropdown(false);
    }

    async function handleGenerateWithAI() {
        setAiError('');
        if (!aiKeywords.trim()) {
            setAiError('Vui lòng nhập từ khóa trước khi gen AI.');
            return;
        }

        setAiGenerating(true);
        try {
            const category = categories.find(c => String(c.id) === String(form.category_id));
            const generated = await aiAPI.generatePost({
                keywords: aiKeywords,
                topic: aiTopic || form.title,
                page_type: category?.page_type || apiFilters.page_type || 'news',
            });

            const generatedTitle = (generated.title || '').trim();
            const generatedSummary = (generated.summary || '').trim();
            const generatedContent = (generated.content || '').trim();

            setForm(prev => {
                const title = generatedTitle || prev.title;
                return {
                    ...prev,
                    title,
                    slug: slugifyPostTitle(title),
                    summary: generatedSummary || prev.summary,
                    content: generatedContent || prev.content,
                };
            });

            // Reflect generated content immediately in the contenteditable editor.
            if (generatedContent && editorRef.current) {
                editorRef.current.innerText = generatedContent;
            }
        } catch (err) {
            setAiError(err.message || 'Không thể gen nội dung AI');
        } finally {
            setAiGenerating(false);
        }
    }

    async function handleSave(e) {
        e.preventDefault();
        if (editorRef.current) {
            form.content = editorRef.current.innerHTML;
        }
        if (!form.title || !form.slug) { alert('Tiêu đề và slug là bắt buộc'); return; }
        setSaving(true);
        try {
            const payload = buildPostSavePayload({ form, currentUser, editingPost });

            if (editingPost) {
                if (!ensureCanMutatePost(currentUser, editingPost, 'Bạn chỉ có thể chỉnh sửa bài viết của mình.')) {
                    return;
                }
                await newsAPI.update(editingPost.id, payload);
            } else {
                await newsAPI.create({ ...payload, is_published: false });
            }
            closeEditor();
            await fetchPosts(apiFilters);
        } catch (err) {
            alert('Lỗi: ' + err.message);
        } finally {
            setSaving(false);
        }
    }

    async function handlePublish(post) {
        if (!canPublish) {
            alert('Bạn không có quyền duyệt bài viết.');
            return;
        }
        if (!window.confirm(`Duyệt và xuất bản bài "${post.title}"?`)) return;
        try {
            await newsAPI.update(post.id, {
                title: post.title,
                slug: post.slug,
                summary: post.summary ?? null,
                content: post.content ?? null,
                thumbnail: post.thumbnail ?? null,
                category_id: post.category_id ?? null,
                author_id: post.author_id ?? null,
                is_featured: !!post.is_featured,
                is_published: true,
            });
            await fetchPosts(apiFilters);
        } catch (err) {
            alert('Duyệt thất bại: ' + err.message);
        }
    }

    async function handleDelete(id) {
        try {
            await deletePostWithGuard({
                id,
                list: posts,
                currentUser,
                deniedMessage: 'Bạn chỉ có thể xóa bài viết của mình.',
                confirmMessage: 'Bạn có chắc muốn xóa bài viết này?',
                onSuccess: (deletedId) => {
                    setPosts(prev => prev.filter(p => p.id !== deletedId));
                },
            });
        } catch (err) {
            alert('Xóa thất bại: ' + err.message);
        }
    }

    function handleFormChange(field, value) {
        setForm(prev => {
            const next = { ...prev, [field]: value };
            if (field === 'title' && !editingPost) next.slug = slugifyPostTitle(value);
            return next;
        });
    }

    function syncContentFromEditor() {
        if (!editorRef.current) return;
        const html = editorRef.current.innerHTML;
        setForm(prev => ({ ...prev, content: html }));
    }

    function applyEditorCommand(command, value = null) {
        if (!editorRef.current) return;
        editorRef.current.focus();
        document.execCommand(command, false, value);
        syncContentFromEditor();
    }

    function handleCreateLink() {
        const link = window.prompt('Nhập URL liên kết (https://...)');
        if (!link) return;
        applyEditorCommand('createLink', link);
    }

    function openImagePicker() {
        imageInputRef.current?.click();
    }

    function handleEditorImageInsert(event) {
        const files = Array.from(event.target.files || []);
        if (!files.length) return;
        insertImageFiles(files);
        event.target.value = '';
    }

    function insertImageFiles(files) {
        if (!editorRef.current) return;
        editorRef.current.focus();

        files.forEach((file) => {
            if (!file.type.startsWith('image/')) return;

            const reader = new FileReader();
            reader.onload = () => {
                const imageUrl = reader.result;
                document.execCommand('insertHTML', false, `<p><img src="${imageUrl}" alt="image" style="max-width:100%;height:auto;border-radius:8px;" /></p><p><br/></p>`);
                syncContentFromEditor();
            };
            reader.readAsDataURL(file);
        });
    }

    function handleEditorDrop(event) {
        const droppedFiles = Array.from(event.dataTransfer?.files || []);
        const images = droppedFiles.filter(file => file.type.startsWith('image/'));
        if (!images.length) return;
        event.preventDefault();
        insertImageFiles(images);
    }

    function pickThumbnailImage() {
        thumbnailInputRef.current?.click();
    }

    function readFileAsDataUrl(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error('Không đọc được file ảnh'));
            reader.readAsDataURL(file);
        });
    }

    async function handleThumbnailUpload(event) {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            alert('Vui lòng chọn file ảnh hợp lệ.');
            return;
        }

        setThumbnailUploading(true);
        try {
            const fileData = await readFileAsDataUrl(file);
            const result = await uploadsAPI.uploadImage(fileData);
            handleFormChange('thumbnail', result?.secure_url || '');
        } catch (err) {
            alert('Upload ảnh thất bại: ' + err.message);
        } finally {
            setThumbnailUploading(false);
        }
    }

    useEffect(() => {
        if (!editorRef.current || viewTab !== 'editor') return;
        editorRef.current.innerHTML = form.content || '<p><br/></p>';
    }, [viewTab, editingPost]);

    const categoriesByPageType = categories.reduce((acc, cat) => {
        const pt = cat.page_type || 'news';
        if (!acc[pt]) acc[pt] = [];
        acc[pt].push(cat);
        return acc;
    }, {});
    const pageTypeOrder = Object.keys(categoriesByPageType).sort((a, b) => {
        const aKnown = Object.prototype.hasOwnProperty.call(PAGE_TYPE_LABELS, a);
        const bKnown = Object.prototype.hasOwnProperty.call(PAGE_TYPE_LABELS, b);
        if (aKnown && !bKnown) return -1;
        if (!aKnown && bKnown) return 1;
        return a.localeCompare(b);
    });
    const filterPageTypeOptions = Array.from(
        new Set([
            ...Object.keys(PAGE_TYPE_LABELS),
            ...categories.map(cat => cat.page_type).filter(Boolean),
        ])
    );
    const selectedCatName = categories.find(c => String(c.id) === String(form.category_id))?.name || '';

    const filteredPosts = posts.filter(post => {
        const matchesSearch = !searchQuery || (post.title || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusTab === 'all'
            || (statusTab === 'pending' && !post.is_published)
            || (statusTab === 'approved' && post.is_published);
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="posts-management">
            {/* Header */}
            <div className="page-header">
                <div className="header-content">
                    <h1 className="page-title">Quản lý bài viết</h1>
                    <p className="page-subtitle">Tạo, chỉnh sửa và quản lý tất cả bài viết</p>
                </div>
                <button className="btn-primary" onClick={openCreate}>
                    <span className="btn-icon">➕</span>
                    Tạo bài viết mới
                </button>
            </div>

            {error && <div style={{ background: '#fee', color: '#c00', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>{error}</div>}

            <div className="tabs-container">
                <div className="tabs">
                    <button className={`tab ${viewTab === 'list' ? 'active' : ''}`} onClick={() => setViewTab('list')}>
                        Danh sách bài viết
                    </button>
                    <button className={`tab ${viewTab === 'editor' ? 'active' : ''}`} onClick={() => setViewTab('editor')}>
                        {editingPost ? 'Chỉnh sửa bài viết' : 'Tạo bài viết'}
                    </button>
                </div>
            </div>

            {viewTab === 'list' ? (
                <>
                    <div className="tabs-container status-tabs-wrap">
                        <div className="tabs">
                            <button className={`tab ${statusTab === 'all' ? 'active' : ''}`} onClick={() => setStatusTab('all')}>
                                Tất cả ({posts.length})
                            </button>
                            <button className={`tab ${statusTab === 'pending' ? 'active' : ''}`} onClick={() => setStatusTab('pending')}>
                                Chờ duyệt ({posts.filter(p => !p.is_published).length})
                            </button>
                            <button className={`tab ${statusTab === 'approved' ? 'active' : ''}`} onClick={() => setStatusTab('approved')}>
                                Đã duyệt ({posts.filter(p => p.is_published).length})
                            </button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="filters-bar">
                        <div className="search-box">
                            <span className="search-icon">🔍</span>
                            <input type="text" placeholder="Tìm kiếm bài viết..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="search-input" />
                            {searchQuery && <span className="search-clear" onClick={() => setSearchQuery('')}>✕</span>}
                        </div>
                        <select className="filter-select" value={apiFilters.year} onChange={e => setApiFilter('year', e.target.value)}>
                            <option value="">Tất cả năm</option>
                            {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                        <select className="filter-select" value={apiFilters.page_type} onChange={e => setApiFilter('page_type', e.target.value)}>
                            <option value="">Tất cả loại</option>
                            {filterPageTypeOptions.map(pageType => (
                                <option key={pageType} value={pageType}>{getPageTypeLabel(pageType)}</option>
                            ))}
                        </select>
                        <select className="filter-select" value={apiFilters.category_id} onChange={e => setApiFilter('category_id', e.target.value)}>
                            <option value="">Tất cả danh mục</option>
                            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </select>
                        <select className="filter-select" value={apiFilters.is_featured} onChange={e => setApiFilter('is_featured', e.target.value)}>
                            <option value="">Tất cả bài viết</option>
                            <option value="true">⭐ Nổi bật</option>
                            <option value="false">Bình thường</option>
                        </select>
                        {hasActiveFilter && (
                            <button className="filter-reset-btn" onClick={resetFilters}>✕ Xóa lọc</button>
                        )}
                    </div>

                    {/* Posts Table */}
                    <div className="posts-table-container">
                        {loading ? (
                            <p style={{ textAlign: 'center', padding: '40px', color: '#888' }}>Đang tải...</p>
                        ) : (
                            <table className="posts-table">
                                <thead>
                                    <tr>
                                        <th>Tiêu đề</th>
                                        <th>Danh mục</th>
                                        <th>Tác giả</th>
                                        <th>Trạng thái</th>
                                        <th>Lượt xem</th>
                                        <th>Ngày tạo</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPosts.length === 0 && (
                                        <tr><td colSpan="7" style={{ textAlign: 'center', color: '#888', padding: '24px' }}>Không có bài viết nào</td></tr>
                                    )}
                                    {filteredPosts.map(post => (
                                        <tr key={post.id}>
                                            <td>
                                                <div className="post-title-cell">
                                                    {post.title}
                                                    {post.is_featured ? <span className="featured-badge">⭐ Nổi bật</span> : null}
                                                </div>
                                            </td>
                                            <td><span className="category-tag">{post.category_name || ''}</span></td>
                                            <td className="author-cell">{post.author_name || ''}</td>
                                            <td>
                                                <span className={`status-badge ${post.is_published ? 'approved' : 'pending'}`}>
                                                    {post.is_published ? 'Đã duyệt' : 'Chờ duyệt'}
                                                </span>
                                            </td>
                                            <td className="views-cell">{post.view_count || 0}</td>
                                            <td className="date-cell">{post.created_at ? new Date(post.created_at).toLocaleDateString('vi-VN') : ''}</td>
                                            <td>
                                                <div className="action-buttons">
                                                    {!post.is_published && canPublish && (
                                                        <button className="btn-action btn-publish" title="Duyệt & Xuất bản" onClick={() => handlePublish(post)}>✅</button>
                                                    )}
                                                    {canMutatePost(currentUser, post) && (
                                                        <button className="btn-action btn-edit" title="Chỉnh sửa" onClick={() => openEdit(post)}>✏️</button>
                                                    )}
                                                    {canMutatePost(currentUser, post) && (
                                                        <button className="btn-action btn-delete" title="Xóa" onClick={() => handleDelete(post.id)}>🗑️</button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </>
            ) : (
                <div className="editor-screen">
                    <div className="editor-header">
                        <h2 className="editor-title">{editingPost ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}</h2>
                        <button type="button" className="btn-secondary" onClick={closeEditor}>← Quay lại danh sách</button>
                    </div>

                    <form className="create-form" onSubmit={handleSave}>
                        <div className="editor-meta-grid">
                            <div className="form-group">
                                <label className="form-label">Danh mục *</label>
                                <div className="cat-dropdown-wrapper" ref={catDropdownRef}>
                                    <button
                                        type="button"
                                        className={`cat-dropdown-trigger${showCatDropdown ? ' open' : ''}`}
                                        onClick={() => { setShowCatDropdown(v => !v); setHoveredPageType(null); }}
                                    >
                                        <span className={`cat-dropdown-value${!selectedCatName ? ' placeholder' : ''}`}>
                                            {selectedCatName || 'Chọn danh mục'}
                                        </span>
                                        <span className="cat-dropdown-arrow">{showCatDropdown ? '▲' : '▼'}</span>
                                    </button>
                                    {showCatDropdown && (
                                        <div className="cat-dropdown-menu">
                                            {pageTypeOrder.length === 0 && (
                                                <div style={{ padding: '12px 16px', color: '#888', fontSize: '14px' }}>Chưa có danh mục</div>
                                            )}
                                            {pageTypeOrder.map(pt => (
                                                <div
                                                    key={pt}
                                                    className={`cat-page-type-row${hoveredPageType === pt ? ' active' : ''}`}
                                                    onMouseEnter={() => setHoveredPageType(pt)}
                                                >
                                                    <span className="cat-page-type-label">{getPageTypeLabel(pt)}</span>
                                                    <span className="cat-page-type-arrow">›</span>
                                                    {hoveredPageType === pt && (
                                                        <div className="cat-page-type-submenu">
                                                            {categoriesByPageType[pt].map(cat => (
                                                                <div
                                                                    key={cat.id}
                                                                    className={`cat-submenu-item${String(form.category_id) === String(cat.id) ? ' selected' : ''}`}
                                                                    onClick={() => { handleFormChange('category_id', cat.id); setShowCatDropdown(false); setHoveredPageType(null); }}
                                                                >
                                                                    {cat.name}
                                                                    {String(form.category_id) === String(cat.id) && <span className="cat-submenu-check"> ✓</span>}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {isAdminFull(currentUser) ? (
                                <div className="form-group">
                                    <label className="form-label">Tác giả</label>
                                    <select className="form-control" value={form.author_id} onChange={e => handleFormChange('author_id', e.target.value)}>
                                        <option value="">-- Chọn tác giả --</option>
                                        {users.map(u => <option key={u.id} value={u.id}>{u.full_name || u.username}</option>)}
                                    </select>
                                </div>
                            ) : (
                                <div className="form-group">
                                    <label className="form-label">Tác giả</label>
                                    <input type="text" className="form-control" value={currentUser?.full_name || currentUser?.username || ''} disabled />
                                </div>
                            )}

                            <div className="form-group full-row">
                                <label className="form-label">Tiêu đề *</label>
                                <input type="text" className="form-control" value={form.title} onChange={e => handleFormChange('title', e.target.value)} placeholder="Nhập tiêu đề bài viết..." required />
                            </div>

                            <div className="form-group full-row">
                                <label className="form-label">Slug *</label>
                                <input type="text" className="form-control" value={form.slug} onChange={e => handleFormChange('slug', e.target.value)} placeholder="slug-bai-viet" required />
                            </div>

                            <div className="form-group full-row">
                                <label className="form-label">Tóm tắt</label>
                                <textarea className="form-control" rows="3" value={form.summary} onChange={e => handleFormChange('summary', e.target.value)} placeholder="Tóm tắt nội dung..." />
                            </div>

                            <div className="form-group full-row">
                                <label className="form-label">URL ảnh bìa</label>
                                <input type="text" className="form-control" value={form.thumbnail} onChange={e => handleFormChange('thumbnail', e.target.value)} placeholder="https://..." />
                                <div style={{ marginTop: '8px' }}>
                                    <button type="button" className="btn-secondary" onClick={pickThumbnailImage} disabled={thumbnailUploading}>
                                        {thumbnailUploading ? 'Đang upload ảnh...' : 'Upload ảnh bìa lên Cloud'}
                                    </button>
                                    <input
                                        ref={thumbnailInputRef}
                                        type="file"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        onChange={handleThumbnailUpload}
                                    />
                                </div>
                            </div>

                            <div className="form-group full-row checkbox-row">
                                <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={form.is_featured} onChange={e => handleFormChange('is_featured', e.target.checked)} />
                                    <span>Bài viết nổi bật</span>
                                </label>
                                {editingPost && canPublish && (
                                    <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <input type="checkbox" checked={form.is_published} onChange={e => handleFormChange('is_published', e.target.checked)} />
                                        <span>Xuất bản ngay</span>
                                    </label>
                                )}
                            </div>
                        </div>

                        <div className="ai-generator-box">
                            <h3 className="ai-generator-title">🤖 Gen AI nội dung</h3>
                            <div className="form-group">
                                <label className="form-label">Từ khóa (phân tách bằng dấu phẩy) *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={aiKeywords}
                                    onChange={e => setAiKeywords(e.target.value)}
                                    placeholder="ví dụ: chào tân sinh viên, hoạt động đoàn, khoa CNTT"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Chủ đề (tuỳ chọn)</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={aiTopic}
                                    onChange={e => setAiTopic(e.target.value)}
                                    placeholder="ví dụ: Chào tân sinh viên K66"
                                />
                            </div>
                            {aiError && <p className="ai-error-text">{aiError}</p>}
                            <button
                                type="button"
                                className="btn-ai"
                                onClick={handleGenerateWithAI}
                                disabled={aiGenerating}
                            >
                                {aiGenerating ? 'Đang gen AI...' : 'Gen AI tiêu đề + tóm tắt + nội dung'}
                            </button>
                        </div>

                        <div className="wp-editor-shell">
                            <div className="wp-editor-toolbar">
                                <button type="button" className="toolbar-btn" onClick={() => applyEditorCommand('bold')}><b>B</b></button>
                                <button type="button" className="toolbar-btn" onClick={() => applyEditorCommand('italic')}><i>I</i></button>
                                <button type="button" className="toolbar-btn" onClick={() => applyEditorCommand('underline')}><u>U</u></button>
                                <button type="button" className="toolbar-btn" onClick={() => applyEditorCommand('insertUnorderedList')}>• List</button>
                                <button type="button" className="toolbar-btn" onClick={() => applyEditorCommand('insertOrderedList')}>1. List</button>
                                <button type="button" className="toolbar-btn" onClick={() => applyEditorCommand('formatBlock', '<h2>')}>H2</button>
                                <button type="button" className="toolbar-btn" onClick={() => applyEditorCommand('formatBlock', '<h3>')}>H3</button>
                                <button type="button" className="toolbar-btn" onClick={handleCreateLink}>Link</button>
                                <button type="button" className="toolbar-btn" onClick={() => applyEditorCommand('unlink')}>Unlink</button>
                                <button type="button" className="toolbar-btn" onClick={openImagePicker}>📷 Thêm ảnh</button>
                            </div>

                            <input
                                ref={imageInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                style={{ display: 'none' }}
                                onChange={handleEditorImageInsert}
                            />

                            <div
                                ref={editorRef}
                                className="wp-editor-body"
                                contentEditable
                                suppressContentEditableWarning
                                onInput={syncContentFromEditor}
                                onDrop={handleEditorDrop}
                                onDragOver={event => event.preventDefault()}
                            />
                        </div>

                        <div className="form-actions">
                            <button type="button" className="btn-secondary" onClick={closeEditor}>Hủy</button>
                            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Đang lưu...' : (editingPost ? 'Cập nhật' : 'Tạo bài viết')}</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
