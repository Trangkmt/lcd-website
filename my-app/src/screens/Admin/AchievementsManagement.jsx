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
    const [achievementCategoryId, setAchievementCategoryId] = useState(null);
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
            const achCat = Array.isArray(cats) ? cats.find(c => c.slug === 'thanh-tich-noi-bat' || c.name === 'ThÃ nh tÃ­ch ná»•i báº­t') : null;
            const catId = achCat ? achCat.id : null;
            setAchievementCategoryId(catId);
            const allNews = await newsAPI.getAll({ limit: 500 });
            const filtered = Array.isArray(allNews)
                ? (catId ? allNews.filter(n => n.category_id === catId) : allNews)
                : [];
            setAchievements(filtered);
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
        setForm({ ...EMPTY_FORM, category_id: achievementCategoryId || '' });
        setShowModal(true);
    }

    function openEdit(item) {
        setSelectedAchievement(item);
        setForm({ title: item.title || '', slug: item.slug || '', summary: item.summary || '', content: item.content || '', thumbnail: item.thumbnail || '', category_id: item.category_id || achievementCategoryId || '', is_featured: !!item.is_featured, is_published: !!item.is_published });
        setShowModal(true);
    }

    async function handleSave(e) {
        e.preventDefault();
        if (!form.title) { alert('Tiêu đề là bắt buộc'); return; }
        setSaving(true);
        try {
            const payload = { ...form, category_id: form.category_id || achievementCategoryId };
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
        if (!window.confirm('')) return;
        try {
            await newsAPI.delete(id);
            setAchievements(prev => prev.filter(a => a.id !== id));
        } catch (err) { alert('Xoá thất bại: ' + err.message); }
    }

    return (
        <div className="achievements-management">
            {/* Header */}
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

            {loading ? (
                <p style={{ textAlign: 'center', padding: '40px', color: '#888' }}>Đang tải...</p>
            ) : (
                <div className="achievements-list">
                    {achievements.length === 0 && <p style={{ color: '#888' }}>Chưa có thành tích nào</p>}
                    {achievements.map(achievement => (
                        <div key={achievement.id} className="achievement-card">
                            <div className="achievement-badge">Danh hiệu</div>
                            <div className="achievement-content">
                                <h3 className="achievement-title">{achievement.title}</h3>
                                <p className="achievement-student">Tên {achievement.author_name || 'Không rõ'}</p>
                                <p className="achievement-description">{achievement.summary}</p>
                                <div className="achievement-meta">
                                    <span className="achievement-category">{achievement.category_name || ''}</span>
                                    <span className="achievement-date">📅 {achievement.created_at ? new Date(achievement.created_at).toLocaleDateString('vi-VN') : ''}</span>
                                    <span className={`achievement-status ${achievement.is_published ? 'published' : 'draft'}`}>{achievement.is_published ? 'Đã đăng' : 'Nháp'}</span>
                                </div>
                            </div>
                            <div className="achievement-actions">
                                <button className="btn-action btn-edit" onClick={() => openEdit(achievement)}>Sửa</button>
                                <button className="btn-action btn-delete" onClick={() => handleDelete(achievement.id)}>🗑️ Xóa</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">{selectedAchievement ? 'Chỉnh sửa thành tích' : 'Thêm thành tích mới'}</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <form className="achievement-form" onSubmit={handleSave}>
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
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <input type="checkbox" checked={form.is_featured} onChange={e => handleFormChange('is_featured', e.target.checked)} />
                                        <span>Nội bật</span>
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
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
