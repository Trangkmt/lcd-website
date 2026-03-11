import React, { useState, useEffect } from 'react';
import './ContactsManagement.css';
import { contactAPI } from '../../services/api';

export default function ContactsManagement() {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedContact, setSelectedContact] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

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

    return (
        <div className="contacts-management">
            {/* Header */}
            <div className="page-header">
                <div className="header-content">
                    <h1 className="page-title">Quản lý liên hệ {unread > 0 && <span className="badge-new">{unread} mới</span>}</h1>
                    <p className="page-subtitle">Xem và quản lý các liên hệ từ sinh viên</p>
                </div>
            </div>

            {loading ? (
                <p style={{ textAlign: 'center', padding: '40px', color: '#888' }}>Đang tải...</p>
            ) : (
                <div className="contacts-container">
                    {contacts.length === 0 && <p style={{ color: '#888' }}>Chưa có liên hệ nào</p>}
                    {contacts.map(contact => (
                        <div key={contact.id} className={`contact-item ${!contact.is_read ? 'unread' : ''}`}>
                            <div className="contact-header">
                                <div className="contact-sender">
                                    <div className="sender-avatar">{(contact.name || '?').charAt(0).toUpperCase()}</div>
                                    <div className="sender-info">
                                        <h3 className="sender-name">{contact.name}</h3>
                                        <p className="sender-email">{contact.email}{contact.phone ? ` · ${contact.phone}` : ''}</p>
                                    </div>
                                </div>
                                <div className="contact-meta">
                                    <span className={`contact-status ${contact.is_replied ? 'replied' : contact.is_read ? 'read' : 'new'}`}>
                                        {contact.is_replied ? '✅ Đã trả lời' : contact.is_read ? '👁️ Đã đọc' : '🆕 Mới'}
                                    </span>
                                    <span className="contact-date">{contact.created_at ? new Date(contact.created_at).toLocaleDateString('vi-VN') : ''}</span>
                                </div>
                            </div>
                            <div className="contact-body">
                                <h4 className="contact-subject">{contact.subject}</h4>
                                <p className="contact-message">{contact.message}</p>
                            </div>
                            <div className="contact-actions">
                                <button className="btn-action btn-reply" onClick={() => handleView(contact)}>👁️ Xem chi tiết</button>
                                {!contact.is_replied && (
                                    <button className="btn-action btn-edit" onClick={() => handleMarkReplied(contact.id)}>✉️ Đánh dấu đã trả lời</button>
                                )}
                                <button className="btn-action btn-delete" onClick={() => handleDelete(contact.id)}>🗑️ Xóa</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Detail Modal */}
            {showDetailModal && selectedContact && (
                <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
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
