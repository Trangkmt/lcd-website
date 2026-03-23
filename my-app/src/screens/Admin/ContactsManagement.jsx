import React, { useState, useEffect } from 'react';
import './ContactsManagement.css';
import { contactAPI } from '../../services/api';

export default function ContactsManagement() {
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
        if (!window.confirm('Bạn có chắc muốn xóa liên hệ này?')) return;
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
                    <p className="page-subtitle">Xem và quản lý các liên hệ từ sinh viên</p>
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
                <div className="search-box">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên, email, chủ đề..."
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
                                    <td colSpan="6" style={{ textAlign: 'center', color: '#888', padding: '24px' }}>
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
                                            <button className="btn-action btn-view" onClick={() => handleView(contact)} title="Xem chi tiết">👁️</button>
                                            {!contact.is_replied && (
                                                <button className="btn-action btn-edit" onClick={() => handleMarkReplied(contact.id)} title="Đánh dấu đã trả lời">✉️</button>
                                            )}
                                            <button className="btn-action btn-delete" onClick={() => handleDelete(contact.id)} title="Xóa liên hệ">🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showDetailModal && selectedContact && (
                <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
                    <div className="modal-content" style={{ maxWidth: '900px' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Chi tiết liên hệ</h2>
                            <button className="modal-close" onClick={() => setShowDetailModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
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
                                    <button className="btn-primary" onClick={() => handleMarkReplied(selectedContact.id)}>✉️ Đánh dấu đã trả lời</button>
                                )}
                                <button className="btn-action btn-delete" onClick={() => handleDelete(selectedContact.id)}>🗑️ Xóa</button>
                                <button className="btn-secondary" onClick={() => setShowDetailModal(false)}>Đóng</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
