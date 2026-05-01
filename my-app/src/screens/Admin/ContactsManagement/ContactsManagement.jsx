import React, { useState, useEffect } from 'react';
import './ContactsManagement.css';
import { SearchBar } from '../../../components';
import { contactAPI } from '../../../services/api';
import { ViewIcon, MailIcon, DeleteIcon, CloseIcon } from '../../../SvgIcons';
import useAdminConfirm from '../useAdminConfirm';

export default function ContactsManagement() {
    const { confirm, confirmModal } = useAdminConfirm();
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedContact, setSelectedContact] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => { fetchContacts(); }, []);

    async function fetchContacts() {
        setLoading(true);
        try {
            const data = await contactAPI.getAll();
            setContacts(Array.isArray(data) ? data : []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }

    async function handleView(contact) {
        setSelectedContact(contact);
        setShowDetailModal(true);
        if (!contact.is_read) {
            try {
                await contactAPI.markAsRead(contact.id);
                setContacts(prev => prev.map(c => c.id === contact.id ? { ...c, is_read: true } : c));
            } catch (err) { console.error(err); }
        }
    }

    async function handleMarkReplied(id) {
        try {
            await contactAPI.markAsReplied(id);
            setContacts(prev => prev.map(c => c.id === id ? { ...c, is_replied: true } : c));
            if (selectedContact?.id === id) setSelectedContact(prev => ({ ...prev, is_replied: true }));
        } catch (err) { alert('Lỗi: ' + err.message); }
    }

    async function handleDelete(id) {
        const confirmed = await confirm({
            title: 'Xác nhận xóa',
            message: 'Bạn có chắc muốn xóa liên hệ này?',
            detail: 'Liên hệ đã xóa sẽ không thể khôi phục.',
            variant: 'delete',
            confirmText: 'Xóa liên hệ',
            confirmButtonClassName: 'btn-action btn-delete',
        });
        if (!confirmed) return;
        try {
            await contactAPI.delete(id);
            setContacts(prev => prev.filter(c => c.id !== id));
            if (selectedContact?.id === id) setShowDetailModal(false);
        } catch (err) { alert('Xóa thất bại: ' + err.message); }
    }

    const unread = contacts.filter(c => !c.is_read).length;
    const filteredContacts = contacts.filter(contact => {
        const matchesSearch = !searchQuery
            || (contact.name || '').toLowerCase().includes(searchQuery.toLowerCase())
            || (contact.email || '').toLowerCase().includes(searchQuery.toLowerCase())
            || (contact.subject || '').toLowerCase().includes(searchQuery.toLowerCase());

        const matchesTab = activeTab === 'all'
            || (activeTab === 'unread' && !contact.is_read)
            || (activeTab === 'replied' && contact.is_replied)
            || (activeTab === 'pending' && !contact.is_replied);

        return matchesSearch && matchesTab;
    });

    return (
        <div className="posts-management contacts-management">
            <div className="page-header">
                <div className="header-content">
                    <h1 className="page-title">Quản lý liên hệ {unread > 0 && <span className="badge-new">{unread} mới</span>}</h1>
                </div>
            </div>

            <div className="tabs-container">
                <div className="tabs">
                    <button className={`tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
                        Tất cả ({contacts.length})
                    </button>
                    <button className={`tab ${activeTab === 'unread' ? 'active' : ''}`} onClick={() => setActiveTab('unread')}>
                        Chưa đọc ({contacts.filter(c => !c.is_read).length})
                    </button>
                    <button className={`tab ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>
                        Chưa trả lời ({contacts.filter(c => !c.is_replied).length})
                    </button>
                    <button className={`tab ${activeTab === 'replied' ? 'active' : ''}`} onClick={() => setActiveTab('replied')}>
                        Đã trả lời ({contacts.filter(c => c.is_replied).length})
                    </button>
                </div>
            </div>

            <div className="filters-bar">
                <SearchBar
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onClear={() => setSearchQuery('')}
                    placeholder="Tìm kiếm theo tên, email, chủ đề..."
                    variant="toolbar"
                />
            </div>

            {loading ? (
                <div className="posts-table-container">
                    <p style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-soft)' }}>Đang tải...</p>
                </div>
            ) : (
                <div className="posts-table-container">
                    <table className="posts-table contacts-table">
                        <thead>
                            <tr>
                                <th>Người gửi</th>
                                <th>Email</th>
                                <th>Chủ đề</th>
                                <th>Trạng thái</th>
                                <th>Ngày gửi</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredContacts.length === 0 && (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', color: 'var(--color-text-soft)', padding: '24px' }}>
                                        Chưa có liên hệ nào
                                    </td>
                                </tr>
                            )}
                            {filteredContacts.map(contact => (
                                <tr key={contact.id} className={!contact.is_read ? 'contact-row-unread' : ''}>
                                    <td className="sender-cell">{contact.name || '-'}</td>
                                    <td className="email-cell">{contact.email || '-'}{contact.phone ? ` · ${contact.phone}` : ''}</td>
                                    <td className="subject-cell">{contact.subject || '(Không có chủ đề)'}</td>
                                    <td>
                                        <span className={`status-badge ${contact.is_replied ? 'approved' : contact.is_read ? 'pending' : 'new'}`}>
                                            {contact.is_replied ? 'Đã trả lời' : contact.is_read ? 'Đã đọc' : 'Mới'}
                                        </span>
                                    </td>
                                    <td className="date-cell">{contact.created_at ? new Date(contact.created_at).toLocaleDateString('vi-VN') : ''}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn-action btn-view btn-action--icon-only" onClick={() => handleView(contact)} title="Xem chi tiết">
                                                <span className="btn-action-icon" aria-hidden="true"><ViewIcon /></span>
                                            </button>
                                            {!contact.is_replied && (
                                                <button className="btn-action btn-edit btn-action--icon-only" onClick={() => handleMarkReplied(contact.id)} title="Đánh dấu đã trả lời">
                                                    <span className="btn-action-icon" aria-hidden="true"><MailIcon /></span>
                                                </button>
                                            )}
                                            <button className="btn-action btn-delete btn-action--icon-only" onClick={() => handleDelete(contact.id)} title="Xóa liên hệ">
                                                <span className="btn-action-icon" aria-hidden="true"><DeleteIcon /></span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showDetailModal && selectedContact && (
                <div className="admin-modal" role="dialog" aria-modal="true" aria-label="Chi tiết liên hệ">
                    <div className="admin-modal__backdrop" onClick={() => setShowDetailModal(false)} />
                    <section className="admin-modal__panel" style={{ maxWidth: '900px' }}>
                        <div className="admin-modal__header">
                            <h2 className="admin-modal__title">Chi tiết liên hệ</h2>
                            <button className="admin-modal__close" onClick={() => setShowDetailModal(false)} aria-label="Đóng">
                                <CloseIcon />
                            </button>
                        </div>
                        <div className="admin-modal__body">
                            <div className="reply-original">
                                <p><strong>Người gửi:</strong> {selectedContact.name}</p>
                                <p><strong>Email:</strong> {selectedContact.email}</p>
                                {selectedContact.phone && <p><strong>Điện thoại:</strong> {selectedContact.phone}</p>}
                                <p><strong>Chủ đề:</strong> {selectedContact.subject}</p>
                                <p><strong>Ngày gửi:</strong> {selectedContact.created_at ? new Date(selectedContact.created_at).toLocaleString('vi-VN') : ''}</p>
                                <hr />
                                <p><strong>Nội dung:</strong></p>
                                <p style={{ whiteSpace: 'pre-wrap' }}>{selectedContact.message}</p>
                            </div>
                            <div className="form-actions" style={{ marginTop: '16px' }}>
                                {!selectedContact.is_replied && (
                                    <button className="btn-primary" onClick={() => handleMarkReplied(selectedContact.id)}>
                                        <span className="btn-icon" aria-hidden="true"><MailIcon /></span>
                                        Đánh dấu đã trả lời
                                    </button>
                                )}
                                <button className="btn-action btn-delete" onClick={() => handleDelete(selectedContact.id)}>
                                    <span className="btn-action-icon" aria-hidden="true"><DeleteIcon /></span>
                                    Xóa
                                </button>
                                <button className="btn-secondary" onClick={() => setShowDetailModal(false)}>Đóng</button>
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {confirmModal}
        </div>
    );
}

