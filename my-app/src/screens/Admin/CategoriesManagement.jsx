import React, { useState, useEffect } from 'react';
import './CategoriesManagement.css';
import { categoriesAPI } from '../../services/api';

function slugify(str) {
    const map = { à: 'a', á: 'a', ả: 'a', ã: 'a', ạ: 'a', ă: 'a', ắ: 'a', ặ: 'a', ằ: 'a', ẳ: 'a', ẵ: 'a', â: 'a', ấ: 'a', ậ: 'a', ầ: 'a', ẩ: 'a', ẫ: 'a', è: 'e', é: 'e', ẻ: 'e', ẽ: 'e', ẹ: 'e', ê: 'e', ế: 'e', ệ: 'e', ề: 'e', ể: 'e', ễ: 'e', ì: 'i', í: 'i', ỉ: 'i', ĩ: 'i', ị: 'i', ò: 'o', ó: 'o', ỏ: 'o', õ: 'o', ọ: 'o', ô: 'o', ố: 'o', ộ: 'o', ồ: 'o', ổ: 'o', ỗ: 'o', ơ: 'o', ớ: 'o', ợ: 'o', ờ: 'o', ở: 'o', ỡ: 'o', ù: 'u', ú: 'u', ủ: 'u', ũ: 'u', ụ: 'u', ư: 'u', ứ: 'u', ự: 'u', ừ: 'u', ử: 'u', ữ: 'u', ỳ: 'y', ý: 'y', ỷ: 'y', ỹ: 'y', ỵ: 'y', đ: 'd' };
    return str.toLowerCase().split('').map(c => map[c] || c).join('').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
}

const PAGE_TABS = [
    { key: 'news', label: '📰 Tin tức' },
    { key: 'achievement', label: '🏆 Thành tích' },
    { key: 'activity_annual', label: '📅 Hoạt động thường niên' },
    { key: 'activity_non_annual', label: '🎯 Hoạt động không thường niên' },
];

const PAGE_TYPE_LABELS = {
    news: 'Tin tức',
    achievement: 'Thành tích',
    activity_annual: 'Hoạt động thường niên',
    activity_non_annual: 'Hoạt động không thường niên',
};

const EMPTY_FORM = (page_type) => ({ name: '', slug: '', description: '', page_type: page_type || 'news', display_order: 0 });

export default function CategoriesManagement() {
    const [activeTab, setActiveTab] = useState('news');
    const [categoriesByTab, setCategoriesByTab] = useState({ news: [], achievement: [], activity_annual: [], activity_non_annual: [] });
    const [loadingTab, setLoadingTab] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM('news'));
    const [saving, setSaving] = useState(false);

    useEffect(() => { fetchTab(activeTab); }, [activeTab]);

    async function fetchTab(tab) {
        if (categoriesByTab[tab]?.length > 0) return; // already loaded
        setLoadingTab(prev => ({ ...prev, [tab]: true }));
        try {
            const data = await categoriesAPI.getAll({ page_type: tab });
            setCategoriesByTab(prev => ({ ...prev, [tab]: Array.isArray(data) ? data : [] }));
        } catch (err) { console.error(err); }
        finally { setLoadingTab(prev => ({ ...prev, [tab]: false })); }
    }

    async function refetchTab(tab) {
        setLoadingTab(prev => ({ ...prev, [tab]: true }));
        try {
            const data = await categoriesAPI.getAll({ page_type: tab });
            setCategoriesByTab(prev => ({ ...prev, [tab]: Array.isArray(data) ? data : [] }));
        } catch (err) { console.error(err); }
        finally { setLoadingTab(prev => ({ ...prev, [tab]: false })); }
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
        setForm(EMPTY_FORM(activeTab));
        setShowModal(true);
    }

    function openEdit(cat) {
        setEditingCategory(cat);
        setForm({
            name: cat.name || '',
            slug: cat.slug || '',
            description: cat.description || '',
            page_type: cat.page_type || activeTab,
            display_order: cat.display_order || 0,
        });
        setShowModal(true);
    }

    async function handleSave(e) {
        e.preventDefault();
        if (!form.name) { alert('Tên danh mục là bắt buộc'); return; }
        setSaving(true);
        try {
            const prevTab = editingCategory?.page_type || activeTab;
            if (editingCategory) {
                await categoriesAPI.update(editingCategory.id, { ...form, is_active: 1 });
            } else {
                await categoriesAPI.create(form);
            }
            setShowModal(false);
            // Refetch affected tabs
            await refetchTab(form.page_type);
            if (prevTab !== form.page_type) await refetchTab(prevTab);
        } catch (err) { alert('Lỗi: ' + err.message); }
        finally { setSaving(false); }
    }

    async function handleDelete(cat) {
        if (!window.confirm('Bạn có chắc muốn xóa danh mục này?')) return;
        try {
            await categoriesAPI.delete(cat.id);
            setCategoriesByTab(prev => ({
                ...prev,
                [cat.page_type || activeTab]: prev[cat.page_type || activeTab].filter(c => c.id !== cat.id),
            }));
        } catch (err) { alert('Xóa thất bại: ' + err.message); }
    }

    const currentList = categoriesByTab[activeTab] || [];
    const isLoading = loadingTab[activeTab];

    return (
        <div className="categories-management">
            {/* Header */}
            <div className="page-header">
                <div className="header-content">
                    <h1 className="page-title">Quản lý danh mục</h1>
                    <p className="page-subtitle">Danh mục được phân theo từng trang của website</p>
                </div>
                <button className="btn-primary" onClick={openCreate}>
                    <span className="btn-icon">➕</span>
                    Thêm danh mục mới
                </button>
            </div>

            {/* Tabs */}
            <div className="cat-tabs">
                {PAGE_TABS.map(tab => (
                    <button
                        key={tab.key}
                        className={`cat-tab ${activeTab === tab.key ? 'cat-tab--active' : ''}`}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        {tab.label}
                        <span className="cat-tab-count">{categoriesByTab[tab.key]?.length ?? 0}</span>
                    </button>
                ))}
            </div>

            {/* Content */}
            {isLoading ? (
                <p style={{ textAlign: 'center', padding: '40px', color: '#888' }}>Đang tải...</p>
            ) : (
                <div className="categories-grid">
                    {currentList.length === 0 && (
                        <p style={{ color: '#888', gridColumn: '1/-1' }}>
                            Chưa có danh mục nào cho trang <b>{PAGE_TYPE_LABELS[activeTab]}</b>.
                        </p>
                    )}
                    {currentList.map(category => (
                        <div key={category.id} className="category-card">
                            <div className="category-header">
                                <h3 className="category-name">{category.name}</h3>
                                <span className="category-posts">{category.display_order ? `#${category.display_order}` : ''}</span>
                            </div>
                            <p className="category-description">{category.description || '—'}</p>
                            <p className="category-slug">/{category.slug}</p>
                            <div className="category-actions">
                                <button className="btn-action btn-edit" onClick={() => openEdit(category)}>✏️ Sửa</button>
                                <button className="btn-action btn-delete" onClick={() => handleDelete(category)}>🗑️ Xóa</button>
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
                                    <label className="form-label">Thuộc trang *</label>
                                    <select
                                        className="form-control"
                                        value={form.page_type}
                                        onChange={e => handleFormChange('page_type', e.target.value)}
                                    >
                                        {PAGE_TABS.map(t => (
                                            <option key={t.key} value={t.key}>{PAGE_TYPE_LABELS[t.key]}</option>
                                        ))}
                                    </select>
                                </div>
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


