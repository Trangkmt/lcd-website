import React, { useState, useEffect } from 'react';
import './CategoriesManagement.css';
import { categoriesAPI } from '../../../services/api';
import { PlusIcon, EditIcon, DeleteIcon, NewsIcon, TrophyIcon, CalendarIcon, TargetIcon, CloseIcon } from '../../../SvgIcons';
import useAdminConfirm from '../useAdminConfirm';

function slugify(str) {
    const map = { à: 'a', á: 'a', ả: 'a', ã: 'a', ạ: 'a', ă: 'a', ắ: 'a', ặ: 'a', ằ: 'a', ẳ: 'a', ẵ: 'a', â: 'a', ấ: 'a', ậ: 'a', ầ: 'a', ẩ: 'a', ẫ: 'a', è: 'e', é: 'e', ẻ: 'e', ẽ: 'e', ẹ: 'e', ê: 'e', ế: 'e', ệ: 'e', ề: 'e', ể: 'e', ễ: 'e', ì: 'i', í: 'i', ỉ: 'i', ĩ: 'i', ị: 'i', ò: 'o', ó: 'o', ỏ: 'o', õ: 'o', ọ: 'o', ô: 'o', ố: 'o', ộ: 'o', ồ: 'o', ổ: 'o', ỗ: 'o', ơ: 'o', ớ: 'o', ợ: 'o', ờ: 'o', ở: 'o', ỡ: 'o', ù: 'u', ú: 'u', ủ: 'u', ũ: 'u', ụ: 'u', ư: 'u', ứ: 'u', ự: 'u', ừ: 'u', ử: 'u', ữ: 'u', ỳ: 'y', ý: 'y', ỷ: 'y', ỹ: 'y', ỵ: 'y', đ: 'd' };
    return str.toLowerCase().split('').map(c => map[c] || c).join('').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
}

const PAGE_TABS = [
    { key: 'news', label: 'Tin tức', icon: NewsIcon },
    { key: 'achievement', label: 'Thành tích', icon: TrophyIcon },
    { key: 'activity_annual', label: 'Hoạt động thường niên', icon: CalendarIcon },
    { key: 'activity_non_annual', label: 'Hoạt động không thường niên', icon: TargetIcon },
];

const PAGE_TYPE_LABELS = {
    news: 'Tin tức',
    achievement: 'Thành tích',
    activity_annual: 'Hoạt động thường niên',
    activity_non_annual: 'Hoạt động không thường niên',
};

const resolveTabKey = (pageType, fallback = 'news') => {
    if (PAGE_TABS.some(tab => tab.key === pageType)) {
        return pageType;
    }

    // Legacy value from old data model.
    if (pageType === 'activity') {
        return fallback;
    }

    return fallback;
};

const normalizeCategoryForTab = (category, tabKey) => ({
    ...category,
    page_type: resolveTabKey(category?.page_type, tabKey),
});

const EMPTY_FORM = (page_type) => ({ name: '', slug: '', description: '', intro_image: '', page_type: page_type || 'news', display_order: 0 });

export default function CategoriesManagement() {
    const { confirm, confirmModal } = useAdminConfirm();
    const [activeTab, setActiveTab] = useState('news');
    const [categoriesByTab, setCategoriesByTab] = useState({ news: [], achievement: [], activity_annual: [], activity_non_annual: [] });
    const [loadingTab, setLoadingTab] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM('news'));
    const [saving, setSaving] = useState(false);

    useEffect(() => { fetchAllCategories(); }, []);

    async function fetchAllCategories() {
        setLoadingTab({ news: true, achievement: true, activity_annual: true, activity_non_annual: true });
        try {
            const data = await categoriesAPI.getAll(); 
            const newCategoriesByTab = { news: [], achievement: [], activity_annual: [], activity_non_annual: [] };
            
            if (Array.isArray(data)) {
                data.forEach(item => {
                    const tabKey = resolveTabKey(item.page_type, 'news');
                    if (newCategoriesByTab[tabKey]) {
                        newCategoriesByTab[tabKey].push(normalizeCategoryForTab(item, tabKey));
                    }
                });
            }
            setCategoriesByTab(newCategoriesByTab);
        } catch (err) { console.error(err); }
        finally { setLoadingTab({}); }
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
            intro_image: cat.intro_image || '',
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
            if (editingCategory) {
                await categoriesAPI.update(editingCategory.id, { ...form, is_active: 1 });
            } else {
                await categoriesAPI.create(form);
            }
            setShowModal(false);
            // Cập nhật lại toàn bộ dữ liệu
            await fetchAllCategories();
        } catch (err) { alert('Lỗi: ' + err.message); }
        finally { setSaving(false); }
    }

    async function handleDelete(cat) {
        const confirmed = await confirm({
            title: 'Xác nhận xóa',
            message: 'Bạn có chắc muốn xóa danh mục này?',
            detail: `Danh mục "${cat.name}" sẽ bị xóa và không thể khôi phục.`,
            variant: 'delete',
            confirmText: 'Xóa danh mục',
            confirmButtonClassName: 'btn-action btn-delete',
        });
        if (!confirmed) return;
        try {
            await categoriesAPI.delete(cat.id);
            const tabKey = resolveTabKey(cat.page_type, activeTab);
            setCategoriesByTab(prev => ({
                ...prev,
                [tabKey]: (prev[tabKey] || []).filter(c => c.id !== cat.id),
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
                </div>
                <button className="btn-primary" onClick={openCreate}>
                    <span className="btn-icon" aria-hidden="true"><PlusIcon /></span>
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
                        <span className="cat-tab-icon" aria-hidden="true"><tab.icon /></span>
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
                            {category.intro_image && (
                                <div className="category-intro-image-wrap">
                                    <img src={category.intro_image} alt={category.name} className="category-intro-image" />
                                </div>
                            )}
                            <div className="category-header">
                                <h3 className="category-name">{category.name}</h3>
                                {category.subcategories_count > 0 && (
                                    <span className="subcategory-badge">
                                        {category.subcategories_count} danh mục con
                                    </span>
                                )}
                            </div>
                            <p className="category-description">{category.description || '—'}</p>
                            <p className="category-slug">/{category.slug}</p>
                            <div className="category-actions">
                                <button className="btn-action btn-edit btn-action--icon-only" onClick={() => openEdit(category)} title="Sửa danh mục" aria-label="Sửa danh mục">
                                    <span className="btn-action-icon" aria-hidden="true"><EditIcon /></span>
                                </button>
                                <button className="btn-action btn-delete btn-action--icon-only" onClick={() => handleDelete(category)} title="Xóa danh mục" aria-label="Xóa danh mục">
                                    <span className="btn-action-icon" aria-hidden="true"><DeleteIcon /></span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="admin-modal" role="dialog" aria-modal="true" aria-label={editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}>
                    <div className="admin-modal__backdrop" onClick={() => setShowModal(false)} />
                    <section className="admin-modal__panel">
                        <div className="admin-modal__header">
                            <h2 className="admin-modal__title">{editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}</h2>
                            <button className="admin-modal__close" onClick={() => setShowModal(false)} aria-label="Đóng">
                                <CloseIcon />
                            </button>
                        </div>
                        <div className="admin-modal__body">
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
                                <div className="form-group">
                                    <label className="form-label">Ảnh giới thiệu (URL)</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={form.intro_image}
                                        onChange={e => handleFormChange('intro_image', e.target.value)}
                                        placeholder="https://..."
                                    />
                                </div>
                                <div className="form-actions">
                                    <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                                    <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Đang lưu...' : (editingCategory ? 'Cập nhật' : 'Tạo mới')}</button>
                                </div>
                            </form>
                        </div>
                    </section>
                </div>
            )}

            {confirmModal}
        </div>
    );
}


