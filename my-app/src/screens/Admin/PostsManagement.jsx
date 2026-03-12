import React, { useState, useEffect, useRef } from 'react';
import './PostsManagement.css';
import { newsAPI, categoriesAPI, usersAPI } from '../../services/api';

function slugify(str) {
    return str.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd').replace(/Đ/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim().replace(/\s+/g, '-');
}

const EMPTY_FORM = { title: '', slug: '', summary: '', content: '', thumbnail: '', category_id: '', author_id: '', is_featured: false, is_published: false };

const PAGE_TYPE_LABELS = {
    news: '📰 Tin tức',
    achievement: '🏆 Thành tích',
    activity_annual: '📅 Hoạt động thường niên',
    activity_non_annual: '🎯 Hoạt động không thường niên',
};

export default function PostsManagement() {
    const [activeTab, setActiveTab] = useState('all');
    const [showModal, setShowModal] = useState(false);
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
    const [showCatDropdown, setShowCatDropdown] = useState(false);
    const [hoveredPageType, setHoveredPageType] = useState(null);
    const catDropdownRef = useRef(null);

    useEffect(() => {
        categoriesAPI.getAll().then(data => setCategories(Array.isArray(data) ? data : [])).catch(() => { });
        usersAPI.getAll().then(data => setUsers(Array.isArray(data) ? data : [])).catch(() => { });
    }, []);

    useEffect(() => {
        fetchPosts(apiFilters);
    }, [apiFilters]);

    const hasActiveFilter = apiFilters.category_id || apiFilters.year || apiFilters.page_type || apiFilters.is_featured !== '';
    const resetFilters = () => setApiFilters({ category_id: '', year: '', page_type: '', is_featured: '' });
    const setApiFilter = (key, value) => setApiFilters(prev => ({ ...prev, [key]: value }));

    const availableYears = React.useMemo(() => {
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
        setForm(EMPTY_FORM);
        setShowModal(true);
    }

    function openEdit(post) {
        setEditingPost(post);
        setForm({
            title: post.title || '',
            slug: post.slug || '',
            summary: post.summary || '',
            content: post.content || '',
            thumbnail: post.thumbnail || '',
            category_id: post.category_id || '',
            author_id: post.author_id || '',
            is_featured: !!post.is_featured,
            is_published: !!post.is_published,
        });
        setShowModal(true);
    }

    async function handleSave(e) {
        e.preventDefault();
        if (!form.title || !form.slug) { alert('Tiêu đề và slug là bắt buộc'); return; }
        setSaving(true);
        try {
            if (editingPost) {
                await newsAPI.update(editingPost.id, form);
            } else {
                await newsAPI.create(form);
            }
            setShowModal(false);
            await fetchPosts(apiFilters);
        } catch (err) {
            alert('Lỗi: ' + err.message);
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(id) {
        if (!window.confirm('Bạn có chắc muốn xóa bài viết này?')) return;
        try {
            await newsAPI.delete(id);
            setPosts(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            alert('Xóa thất bại: ' + err.message);
        }
    }

    function handleFormChange(field, value) {
        setForm(prev => {
            const next = { ...prev, [field]: value };
            if (field === 'title' && !editingPost) next.slug = slugify(value);
            return next;
        });
    }

    const categoriesByPageType = categories.reduce((acc, cat) => {
        const pt = cat.page_type || 'news';
        if (!acc[pt]) acc[pt] = [];
        acc[pt].push(cat);
        return acc;
    }, {});
    const pageTypeOrder = Object.keys(PAGE_TYPE_LABELS).filter(pt => categoriesByPageType[pt]?.length > 0);
    const selectedCatName = categories.find(c => String(c.id) === String(form.category_id))?.name || '';

    const filteredPosts = posts.filter(post => {
        const matchesSearch = !searchQuery || (post.title || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = activeTab === 'all'
            || (activeTab === 'pending' && !post.is_published)
            || (activeTab === 'approved' && post.is_published);
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

            {/* Tabs */}
            <div className="tabs-container">
                <div className="tabs">
                    <button className={`tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
                        Tất cả ({posts.length})
                    </button>
                    <button className={`tab ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>
                        Chờ duyệt ({posts.filter(p => !p.is_published).length})
                    </button>
                    <button className={`tab ${activeTab === 'approved' ? 'active' : ''}`} onClick={() => setActiveTab('approved')}>
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
                    {Object.entries(PAGE_TYPE_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
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
                                            <button className="btn-action btn-edit" title="Chỉnh sửa" onClick={() => openEdit(post)}>✏️</button>
                                            <button className="btn-action btn-delete" title="Xóa" onClick={() => handleDelete(post.id)}>🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" style={{ maxWidth: '1000px' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">{editingPost ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <form className="create-form" onSubmit={handleSave}>
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
                                                        <span className="cat-page-type-label">{PAGE_TYPE_LABELS[pt]}</span>
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
                                <div className="form-group">
                                    <label className="form-label">Tác giả</label>
                                    <select className="form-control" value={form.author_id} onChange={e => handleFormChange('author_id', e.target.value)}>
                                        <option value="">-- Chọn tác giả --</option>
                                        {users.map(u => <option key={u.id} value={u.id}>{u.full_name || u.username}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Tiêu đề *</label>
                                    <input type="text" className="form-control" value={form.title} onChange={e => handleFormChange('title', e.target.value)} placeholder="Nhập tiêu đề bài viết..." required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Slug *</label>
                                    <input type="text" className="form-control" value={form.slug} onChange={e => handleFormChange('slug', e.target.value)} placeholder="slug-bai-viet" required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Tóm tắt</label>
                                    <textarea className="form-control" rows="3" value={form.summary} onChange={e => handleFormChange('summary', e.target.value)} placeholder="Tóm tắt nội dung..." />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Nội dung *</label>
                                    <textarea className="form-control" rows="8" value={form.content} onChange={e => handleFormChange('content', e.target.value)} placeholder="Nhập nội dung bài viết..." />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">URL ảnh bìa</label>
                                    <input type="text" className="form-control" value={form.thumbnail} onChange={e => handleFormChange('thumbnail', e.target.value)} placeholder="https://..." />
                                </div>
                                <div className="form-group" style={{ display: 'flex', gap: '24px' }}>
                                    <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <input type="checkbox" checked={form.is_featured} onChange={e => handleFormChange('is_featured', e.target.checked)} />
                                        <span>Bài viết nổi bật</span>
                                    </label>
                                    <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <input type="checkbox" checked={form.is_published} onChange={e => handleFormChange('is_published', e.target.checked)} />
                                        <span>Xuất bản ngay</span>
                                    </label>
                                </div>
                                <div className="form-actions">
                                    <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                                    <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Đang lưu...' : (editingPost ? 'Cập nhật' : 'Tạo bài viết')}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
