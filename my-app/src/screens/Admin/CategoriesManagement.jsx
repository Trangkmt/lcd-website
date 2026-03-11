import React, { useState, useEffect } from 'react';
import './CategoriesManagement.css';
import { categoriesAPI } from '../../services/api';

function slugify(str) {
    const map = { à: 'a', á: 'a', ả: 'a', ã: 'a', ạ: 'a', ă: 'a', ắ: 'a', ặ: 'a', ằ: 'a', ẳ: 'a', ẵ: 'a', â: 'a', ấ: 'a', ậ: 'a', ầ: 'a', ẩ: 'a', ẫ: 'a', è: 'e', é: 'e', ẻ: 'e', ẽ: 'e', ẹ: 'e', ê: 'e', ế: 'e', ệ: 'e', ề: 'e', ể: 'e', ễ: 'e', ì: 'i', í: 'i', ỉ: 'i', ĩ: 'i', ị: 'i', ò: 'o', ó: 'o', ỏ: 'o', õ: 'o', ọ: 'o', ô: 'o', ố: 'o', ộ: 'o', ồ: 'o', ổ: 'o', ỗ: 'o', ơ: 'o', ớ: 'o', ợ: 'o', ờ: 'o', ở: 'o', ỡ: 'o', ù: 'u', ú: 'u', ủ: 'u', ũ: 'u', ụ: 'u', ư: 'u', ứ: 'u', ự: 'u', ừ: 'u', ử: 'u', ữ: 'u', ỳ: 'y', ý: 'y', ỷ: 'y', ỹ: 'y', ỵ: 'y', đ: 'd' };
    return str.toLowerCase().split('').map(c => map[c] || c).join('').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
}

const EMPTY_FORM = { name: '', slug: '', description: '', display_order: 0 };

export default function CategoriesManagement() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    useEffect(() => { fetchCategories(); }, []);

    async function fetchCategories() {
        setLoading(true);
        try {
            const data = await categoriesAPI.getAll();
            setCategories(Array.isArray(data) ? data : []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }

    function handleFormChange(field, value) {
        setForm(prev => {
            const updated = { ...prev, [field]: value };
            if (field === 'name') updated.slug = slugify(value);
            return updated;
        });
    }

    function openCreate() {
        setEditingCategory(null);
        setForm(EMPTY_FORM);
        setShowModal(true);
    }

    function openEdit(cat) {
        setEditingCategory(cat);
        setForm({ name: cat.name || '', slug: cat.slug || '', description: cat.description || '', display_order: cat.display_order || 0 });
        setShowModal(true);
    }

    async function handleSave(e) {
        e.preventDefault();
        if (!form.name) { alert('Tên danh mục là bắt buộc'); return; }
        setSaving(true);
        try {
            if (editingCategory) {
                const updated = await categoriesAPI.update(editingCategory.id, form);
                setCategories(prev => prev.map(c => c.id === editingCategory.id ? { ...c, ...updated } : c));
            } else {
                const created = await categoriesAPI.create(form);
                setCategories(prev => [...prev, created]);
            }
            setShowModal(false);
        } catch (err) { alert('Lỗi: ' + err.message); }
        finally { setSaving(false); }
    }

    async function handleDelete(id) {
        if (!window.confirm('Bạn có chắc muốn xóa danh mục này?')) return;
        try {
            await categoriesAPI.delete(id);
            setCategories(prev => prev.filter(c => c.id !== id));
        } catch (err) { alert('Xóa thất bại: ' + err.message); }
    }

    return (
        <div className="categories-management">
            {/* Header */}
            <div className="page-header">
                <div className="header-content">
                    <h1 className="page-title">Quản lý danh mục</h1>
                    <p className="page-subtitle">Quản lý các danh mục bài viết và hoạt động</p>
                </div>
                <button className="btn-primary" onClick={openCreate}>
                    <span className="btn-icon">➕</span>
                    Thêm danh mục mới
                </button>
            </div>

            {loading ? (
                <p style={{ textAlign: 'center', padding: '40px', color: '#888' }}>Đang tải...</p>
            ) : (
                <div className="categories-grid">
                    {categories.length === 0 && <p style={{ color: '#888' }}>Chưa có danh mục nào</p>}
                    {categories.map(category => (
                        <div key={category.id} className="category-card">
                            <div className="category-header">
                                <h3 className="category-name">{category.name}</h3>
                                <span className="category-posts">{category.display_order ? `#${category.display_order}` : ''}</span>
                            </div>
                            <p className="category-description">{category.description || '—'}</p>
                            <p className="category-slug">/{category.slug}</p>
                            <div className="category-actions">
                                <button className="btn-action btn-edit" onClick={() => openEdit(category)}>✏️ Sửa</button>
                                <button className="btn-action btn-delete" onClick={() => handleDelete(category.id)}>🗑️ Xóa</button>
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
                            <h2 className="modal-title">{editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <form className="category-form" onSubmit={handleSave}>
                                <div className="form-group">
                                    <label className="form-label">Tên danh mục *</label>
                                    <input type="text" className="form-control" value={form.name} onChange={e => handleFormChange('name', e.target.value)} placeholder="Nhập tên danh mục..." required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Slug</label>
                                    <input type="text" className="form-control" value={form.slug} onChange={e => handleFormChange('slug', e.target.value)} placeholder="slug-tu-dong-tao" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Thứ tự hiển thị</label>
                                    <input type="number" className="form-control" value={form.display_order} onChange={e => handleFormChange('display_order', parseInt(e.target.value) || 0)} min="0" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Mô tả</label>
                                    <textarea className="form-control" rows="4" value={form.description} onChange={e => handleFormChange('description', e.target.value)} placeholder="Nhập mô tả danh mục..."></textarea>
                                </div>
                                <div className="form-actions">
                                    <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                                    <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Đang lưu...' : (editingCategory ? 'Cập nhật' : 'Tạo mới')}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

