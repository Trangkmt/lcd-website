import React, { useState, useEffect } from 'react';
import './AchievementsManagement.css';
import { newsAPI, categoriesAPI } from '../../services/api';

function slugify(str) {
    const map = {
        à: 'a', á: 'a', ả: 'a', ã: 'a', ạ: 'a',
        ă: 'a', ắ: 'a', ặ: 'a', ằ: 'a', ẳ: 'a', ẵ: 'a',
        â: 'a', ấ: 'a', ậ: 'a', ầ: 'a', ẩ: 'a', ẫ: 'a',
        è: 'e', é: 'e', ẻ: 'e', ẽ: 'e', ẹ: 'e',
        ê: 'e', ế: 'e', ệ: 'e', ề: 'e', ể: 'e', ễ: 'e',
        ì: 'i', í: 'i', ỉ: 'i', ĩ: 'i', ị: 'i',
        ò: 'o', ó: 'o', ỏ: 'o', õ: 'o', ọ: 'o',
        ô: 'o', ố: 'o', ộ: 'o', ồ: 'o', ổ: 'o', ỗ: 'o',
        ơ: 'o', ớ: 'o', ợ: 'o', ờ: 'o', ở: 'o', ỡ: 'o',
        ù: 'u', ú: 'u', ủ: 'u', ũ: 'u', ụ: 'u',
        ư: 'u', ứ: 'u', ự: 'u', ừ: 'u', ử: 'u', ữ: 'u',
        ỳ: 'y', ý: 'y', ỷ: 'y', ỹ: 'y', ỵ: 'y',
        đ: 'd'
    };
    return str.toLowerCase().split('').map(c => map[c] || c).join('').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
}

const EMPTY_FORM = { title: '', slug: '', summary: '', content: '', thumbnail: '', category_id: '', is_featured: true, is_published: true };

export default function AchievementsManagement() {
    const [achievements, setAchievements] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedAchievement, setSelectedAchievement] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    useEffect(() => { fetchAchievements(); }, []);

    async function fetchAchievements() {
        setLoading(true);
        try {
            const cats = await categoriesAPI.getAll();
            const achievementCategories = Array.isArray(cats) ? cats.filter(c => c.page_type === 'achievement') : [];
            setCategories(achievementCategories);
            const allNews = await newsAPI.getAll({ limit: 500, page_type: 'achievement', include_unpublished: true });
            setAchievements(Array.isArray(allNews) ? allNews : []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }

    function handleFormChange(field, value) {
        setForm(prev => {
            const updated = { ...prev, [field]: value };
            if (field === 'title') updated.slug = slugify(value);
            return updated;
        });
    }

    function openCreate() {
        setSelectedAchievement(null);
        setForm({ ...EMPTY_FORM, category_id: categories[0]?.id || '' });
        setShowModal(true);
    }

    function openEdit(item) {
        setSelectedAchievement(item);
        setForm({ title: item.title || '', slug: item.slug || '', summary: item.summary || '', content: item.content || '', thumbnail: item.thumbnail || '', category_id: item.category_id || categories[0]?.id || '', is_featured: !!item.is_featured, is_published: !!item.is_published });
        setShowModal(true);
    }

    async function handleSave(e) {
        e.preventDefault();
        if (!form.title) { alert('Tiêu đề là bắt buộc'); return; }
        setSaving(true);
        try {
            const payload = { ...form, category_id: form.category_id || categories[0]?.id || null };
            if (selectedAchievement) {
                const updated = await newsAPI.update(selectedAchievement.id, payload);
                setAchievements(prev => prev.map(a => a.id === selectedAchievement.id ? { ...a, ...updated } : a));
            } else {
                const created = await newsAPI.create(payload);
                setAchievements(prev => [created, ...prev]);
            }
            setShowModal(false);
        } catch (err) { alert('Lá»—i: ' + err.message); }
        finally { setSaving(false); }
    }

    async function handleDelete(id) {
        if (!window.confirm('Bạn có chắc muốn xóa thành tích này?')) return;
        try {
            await newsAPI.delete(id);
            setAchievements(prev => prev.filter(a => a.id !== id));
        } catch (err) { alert('Xoá thất bại: ' + err.message); }
    }

    const filteredAchievements = achievements.filter(item => {
        const matchesSearch = !searchQuery || (item.title || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = activeTab === 'all'
            || (activeTab === 'pending' && !item.is_published)
            || (activeTab === 'approved' && item.is_published);
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="posts-management achievements-management">
            <div className="page-header">
                <div className="header-content">
                    <h1 className="page-title">Quản lý thành tích nổi bật</h1>
                    <p className="page-subtitle">Quản lý các thành tích xuất sắc của sinh viên</p>
                </div>
                <button className="btn-primary" onClick={openCreate}>
                    <span className="btn-icon">Thêm</span>
                    Thêm thành tích mới
                </button>
            </div>

            <div className="tabs-container">
                <div className="tabs">
                    <button className={`tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
                        Tất cả ({achievements.length})
                    </button>
                    <button className={`tab ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>
                        Chờ duyệt ({achievements.filter(a => !a.is_published).length})
                    </button>
                    <button className={`tab ${activeTab === 'approved' ? 'active' : ''}`} onClick={() => setActiveTab('approved')}>
                        Đã duyệt ({achievements.filter(a => a.is_published).length})
                    </button>
                </div>
            </div>

            <div className="filters-bar">
                <div className="search-box">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Tìm kiếm thành tích..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                    {searchQuery && <span className="search-clear" onClick={() => setSearchQuery('')}>✕</span>}
                </div>
            </div>

            {loading ? (
                <div className="posts-table-container">
                    <p style={{ textAlign: 'center', padding: '40px', color: '#888' }}>Đang tải...</p>
                </div>
            ) : (
                <div className="posts-table-container">
                    <table className="posts-table">
                        <thead>
                            <tr>
                                <th>Tiêu đề</th>
                                <th>Danh mục</th>
                                <th>Tóm tắt</th>
                                <th>Trạng thái</th>
                                <th>Ngày tạo</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAchievements.length === 0 && (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', color: '#888', padding: '24px' }}>
                                        Không có thành tích nào
                                    </td>
                                </tr>
                            )}
                            {filteredAchievements.map(achievement => (
                                <tr key={achievement.id}>
                                    <td>
                                        <div className="post-title-cell">
                                            {achievement.title}
                                            {achievement.is_featured ? <span className="featured-badge">⭐ Nổi bật</span> : null}
                                        </div>
                                    </td>
                                    <td><span className="category-tag">{achievement.category_name || ''}</span></td>
                                    <td className="achievement-summary-cell">{achievement.summary || ''}</td>
                                    <td>
                                        <span className={`status-badge ${achievement.is_published ? 'approved' : 'pending'}`}>
                                            {achievement.is_published ? 'Đã duyệt' : 'Chờ duyệt'}
                                        </span>
                                    </td>
                                    <td className="date-cell">{achievement.created_at ? new Date(achievement.created_at).toLocaleDateString('vi-VN') : ''}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn-action btn-edit" title="Chỉnh sửa" onClick={() => openEdit(achievement)}>✏️</button>
                                            <button className="btn-action btn-delete" title="Xóa" onClick={() => handleDelete(achievement.id)}>🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" style={{ maxWidth: '1000px' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">{selectedAchievement ? 'Chỉnh sửa thành tích' : 'Thêm thành tích mới'}</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <form className="create-form" onSubmit={handleSave}>
                                <div className="form-group">
                                    <label className="form-label">Danh mục *</label>
                                    <select className="form-control" value={form.category_id} onChange={e => handleFormChange('category_id', e.target.value)}>
                                        <option value="">-- Chọn danh mục --</option>
                                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Tiêu đề *</label>
                                    <input type="text" className="form-control" value={form.title} onChange={e => handleFormChange('title', e.target.value)} placeholder="Tiêu đề thành tích..." required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Slug</label>
                                    <input type="text" className="form-control" value={form.slug} onChange={e => handleFormChange('slug', e.target.value)} placeholder="slug-tu-dong-tao" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Tóm tắt</label>
                                    <textarea className="form-control" rows="3" value={form.summary} onChange={e => handleFormChange('summary', e.target.value)} placeholder="Mô tả ngắn..."></textarea>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Nội dung chi tiết</label>
                                    <textarea className="form-control" rows="6" value={form.content} onChange={e => handleFormChange('content', e.target.value)} placeholder="Nội dung đầy đủ..."></textarea>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">URL ảnh thumbnail</label>
                                    <input type="text" className="form-control" value={form.thumbnail} onChange={e => handleFormChange('thumbnail', e.target.value)} placeholder="https://..." />
                                </div>
                                <div className="form-group" style={{ display: 'flex', gap: '16px' }}>
                                    <label className="checkbox-label">
                                        <input type="checkbox" checked={form.is_featured} onChange={e => handleFormChange('is_featured', e.target.checked)} />
                                        <span>Nội bật</span>
                                    </label>
                                    <label className="checkbox-label">
                                        <input type="checkbox" checked={form.is_published} onChange={e => handleFormChange('is_published', e.target.checked)} />
                                        <span>Đã đăng</span>
                                    </label>
                                </div>
                                <div className="form-actions">
                                    <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                                    <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Đang lưu...' : (selectedAchievement ? 'Cập nhật' : 'Thêm mới')}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
