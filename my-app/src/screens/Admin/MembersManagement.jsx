import React, { useState, useEffect } from 'react';
import './MembersManagement.css';
import { usersAPI } from '../../services/api';

const EMPTY_FORM = { username: '', password: '', email: '', full_name: '', role: 'user', is_active: true };

export default function MembersManagement() {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchMembers();
    }, []);

    async function fetchMembers() {
        setLoading(true);
        try {
            const data = await usersAPI.getAll();
            setMembers(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    function openCreate() {
        setSelectedMember(null);
        setForm(EMPTY_FORM);
        setShowModal(true);
    }

    function openEdit(member) {
        setSelectedMember(member);
        setForm({
            username: member.username || '',
            password: '',
            email: member.email || '',
            full_name: member.full_name || '',
            role: member.role || 'user',
            is_active: member.is_active !== undefined ? !!member.is_active : true,
        });
        setShowModal(true);
    }

    async function handleSave(e) {
        e.preventDefault();
        setSaving(true);
        try {
            if (selectedMember) {
                const payload = { email: form.email, full_name: form.full_name, role: form.role, is_active: form.is_active };
                const updated = await usersAPI.update(selectedMember.id, payload);
                setMembers(prev => prev.map(m => m.id === selectedMember.id ? { ...m, ...updated } : m));
            } else {
                if (!form.username || !form.password || !form.email) { alert('Username, mật khẩu và email là bắt buộc'); return; }
                const created = await usersAPI.create(form);
                setMembers(prev => [created, ...prev]);
            }
            setShowModal(false);
        } catch (err) {
            alert('Lỗi: ' + err.message);
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(id) {
        if (!window.confirm('Bạn có chắc muốn xóa thành viên này?')) return;
        try {
            await usersAPI.delete(id);
            setMembers(prev => prev.filter(m => m.id !== id));
        } catch (err) {
            alert('Xóa thất bại: ' + err.message);
        }
    }

    return (
        <div className="members-management">
            {/* Header */}
            <div className="page-header">
                <div className="header-content">
                    <h1 className="page-title">Quản lý thành viên</h1>
                    <p className="page-subtitle">Quản lý thành viên liên chi đoàn</p>
                </div>
                <button className="btn-primary" onClick={openCreate}>
                    <span className="btn-icon">➕</span>
                    Thêm thành viên mới
                </button>
            </div>

            {loading ? (
                <p style={{ textAlign: 'center', padding: '40px', color: '#888' }}>Đang tải...</p>
            ) : (
                <div className="members-grid">
                    {members.length === 0 && <p style={{ color: '#888' }}>Chưa có thành viên nào</p>}
                    {members.map(member => (
                        <div key={member.id} className="member-card">
                            <div className="member-avatar">
                                <span className="avatar-text">{(member.full_name || member.username || '?').charAt(0).toUpperCase()}</span>
                            </div>
                            <div className="member-info">
                                <h3 className="member-name">{member.full_name || member.username}</h3>
                                <p className="member-role">{member.role}</p>
                                <p className="member-email">📧 {member.email}</p>
                                <p className="member-department">{member.is_active ? '✅ Đang hoạt động' : '❌ Vô hiệu hóa'}</p>
                            </div>
                            <div className="member-actions">
                                <button className="btn-action btn-edit" onClick={() => openEdit(member)}>✏️ Sửa</button>
                                <button className="btn-action btn-delete" onClick={() => handleDelete(member.id)}>🗑️ Xóa</button>
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
                            <h2 className="modal-title">{selectedMember ? 'Chỉnh sửa thành viên' : 'Thêm thành viên mới'}</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <form className="member-form" onSubmit={handleSave}>
                                {!selectedMember && (
                                    <div className="form-group">
                                        <label className="form-label">Tên đăng nhập *</label>
                                        <input type="text" className="form-control" value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))} placeholder="username" required />
                                    </div>
                                )}
                                {!selectedMember && (
                                    <div className="form-group">
                                        <label className="form-label">Mật khẩu *</label>
                                        <input type="password" className="form-control" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="••••••••" required />
                                    </div>
                                )}
                                <div className="form-group">
                                    <label className="form-label">Họ và tên</label>
                                    <input type="text" className="form-control" value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} placeholder="Nguyễn Văn A" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Email *</label>
                                    <input type="email" className="form-control" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="email@fit.hcmus.edu.vn" required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Vai trò *</label>
                                    <select className="form-control" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                                        <option value="user">Thành viên</option>
                                        <option value="admin">Quản trị viên</option>
                                        <option value="editor">Biên tập viên</option>
                                    </select>
                                </div>
                                {selectedMember && (
                                    <div className="form-group">
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                            <input type="checkbox" checked={form.is_active} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))} />
                                            <span>Đang hoạt động</span>
                                        </label>
                                    </div>
                                )}
                                <div className="form-actions">
                                    <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                                    <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Đang lưu...' : (selectedMember ? 'Cập nhật' : 'Thêm thành viên')}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
