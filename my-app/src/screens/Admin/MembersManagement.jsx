import React, { useState, useEffect } from 'react';
import './MembersManagement.css';
import { usersAPI } from '../../services/api';

const TABS = {
    STUDENT: 'student',
    TEACHER: 'teacher',
};

const DEPARTMENTS = ['ttkt', 'ctd & ptd', 'tcsk', 'văn thể', 'đối ngoại'];
const POSITIONS = ['trưởng ban', 'phó ban', 'thành viên'];

const EMPTY_FORM = {
    username: '',
    password: '',
    email: '',
    full_name: '',
    member_type: TABS.STUDENT,
    student_code: '',
    class_name: '',
    department: DEPARTMENTS[0],
    department_position: POSITIONS[2],
    is_active: true,
};

function inferMemberType(member) {
    if (member.member_type === TABS.TEACHER || member.role === 'teacher') return TABS.TEACHER;
    return TABS.STUDENT;
}

function generateUsername(email) {
    const localPart = String(email || 'user').split('@')[0] || 'user';
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `${localPart}-${randomSuffix}`;
}

export default function MembersManagement() {
    const [members, setMembers] = useState([]);
    const [activeTab, setActiveTab] = useState(TABS.STUDENT);
    const [showHidden, setShowHidden] = useState(false);
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
        setForm({ ...EMPTY_FORM, member_type: activeTab });
        setShowModal(true);
    }

    function openEdit(member) {
        setSelectedMember(member);
        const memberType = inferMemberType(member);
        setForm({
            username: member.username || '',
            password: '',
            email: member.email || '',
            full_name: member.full_name || '',
            member_type: memberType,
            student_code: member.student_code || '',
            class_name: member.class_name || '',
            department: member.department || DEPARTMENTS[0],
            department_position: member.department_position || POSITIONS[2],
            is_active: member.is_active !== undefined ? !!member.is_active : true,
        });
        setShowModal(true);
    }

    function buildRoleByForm(nextForm) {
        if (nextForm.member_type === TABS.TEACHER) return 'teacher';
        return 'student';
    }

    async function handleSave(e) {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                email: form.email,
                full_name: form.full_name,
                role: buildRoleByForm(form),
                is_active: form.is_active,
                member_type: form.member_type,
                student_code: form.member_type === TABS.STUDENT ? form.student_code : null,
                class_name: form.member_type === TABS.STUDENT ? form.class_name : null,
                department: form.member_type === TABS.STUDENT ? form.department : null,
                department_position: form.member_type === TABS.STUDENT ? form.department_position : null,
            };

            if (!payload.full_name || !payload.email) {
                alert('Họ tên và gmail là bắt buộc');
                return;
            }

            if (payload.member_type === TABS.STUDENT && (!payload.student_code || !payload.class_name)) {
                alert('Sinh viên cần nhập mã sinh viên và lớp');
                return;
            }

            if (selectedMember) {
                const updated = await usersAPI.update(selectedMember.id, payload);
                setMembers(prev => prev.map(m => m.id === selectedMember.id ? { ...m, ...updated } : m));
            } else {
                const username = form.username?.trim() || generateUsername(form.email);
                if (!form.password) {
                    alert('Mật khẩu là bắt buộc khi thêm thành viên mới');
                    return;
                }
                const created = await usersAPI.create({
                    username,
                    password: form.password,
                    ...payload,
                });
                setMembers(prev => [created, ...prev]);
            }
            setShowModal(false);
        } catch (err) {
            alert('Lỗi: ' + err.message);
        } finally {
            setSaving(false);
        }
    }

    async function handleToggleActive(member) {
        const nextActive = !member.is_active;
        const confirmText = nextActive
            ? 'Bạn có muốn hiển thị lại thành viên này không?'
            : 'Bạn có chắc muốn ẩn thành viên này không?';
        if (!window.confirm(confirmText)) return;

        try {
            const payload = {
                email: member.email,
                full_name: member.full_name,
                role: member.role || buildRoleByForm(member),
                is_active: nextActive,
                member_type: inferMemberType(member),
                student_code: member.student_code || null,
                class_name: member.class_name || null,
                department: member.department || null,
                department_position: member.department_position || null,
            };
            const updated = await usersAPI.update(member.id, payload);
            setMembers(prev => prev.map(m => m.id === member.id ? { ...m, ...updated } : m));
        } catch (err) {
            alert('Cập nhật trạng thái thất bại: ' + err.message);
        }
    }

    const filteredMembers = members.filter((member) => inferMemberType(member) === activeTab);
    const visibleMembers = showHidden
        ? filteredMembers
        : filteredMembers.filter((member) => !!member.is_active);

    const isStudentTab = activeTab === TABS.STUDENT;

    return (
        <div className="members-management">
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

            <div className="members-toolbar">
                <div className="tabs">
                    <button
                        type="button"
                        className={`tab-btn ${activeTab === TABS.STUDENT ? 'active' : ''}`}
                        onClick={() => setActiveTab(TABS.STUDENT)}
                    >
                        Sinh viên
                    </button>
                    <button
                        type="button"
                        className={`tab-btn ${activeTab === TABS.TEACHER ? 'active' : ''}`}
                        onClick={() => setActiveTab(TABS.TEACHER)}
                    >
                        Thầy cô
                    </button>
                </div>

                <label className="toggle-hidden">
                    <input
                        type="checkbox"
                        checked={showHidden}
                        onChange={(e) => setShowHidden(e.target.checked)}
                    />
                    <span>Hiển thị thành viên đã ẩn</span>
                </label>
            </div>

            {loading ? (
                <p className="loading-text">Đang tải...</p>
            ) : (
                <div className="table-wrapper">
                    <table className="members-table">
                        <thead>
                            {isStudentTab ? (
                                <tr>
                                    <th>Họ và tên</th>
                                    <th>Mã sinh viên</th>
                                    <th>Lớp</th>
                                    <th>Gmail</th>
                                    <th>Ban</th>
                                    <th>Chức vụ</th>
                                    <th>Hành động</th>
                                </tr>
                            ) : (
                                <tr>
                                    <th>Họ và tên</th>
                                    <th>Gmail</th>
                                    <th>Hành động</th>
                                </tr>
                            )}
                        </thead>
                        <tbody>
                            {visibleMembers.length === 0 && (
                                <tr>
                                    <td colSpan={isStudentTab ? 7 : 3} className="empty-cell">
                                        Chưa có thành viên phù hợp
                                    </td>
                                </tr>
                            )}

                            {visibleMembers.map((member) => (
                                isStudentTab ? (
                                    <tr key={member.id} className={!member.is_active ? 'row-hidden' : ''}>
                                        <td>{member.full_name || '-'}</td>
                                        <td>{member.student_code || '-'}</td>
                                        <td>{member.class_name || '-'}</td>
                                        <td>{member.email || '-'}</td>
                                        <td>{member.department || '-'}</td>
                                        <td>{member.department_position || '-'}</td>
                                        <td>
                                            <div className="row-actions">
                                                <button className="btn-action btn-edit" onClick={() => openEdit(member)}>Sửa</button>
                                                <button
                                                    className={`btn-action ${member.is_active ? 'btn-hide' : 'btn-show'}`}
                                                    onClick={() => handleToggleActive(member)}
                                                >
                                                    {member.is_active ? 'Ẩn' : 'Hiện'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    <tr key={member.id} className={!member.is_active ? 'row-hidden' : ''}>
                                        <td>{member.full_name || '-'}</td>
                                        <td>{member.email || '-'}</td>
                                        <td>
                                            <div className="row-actions">
                                                <button className="btn-action btn-edit" onClick={() => openEdit(member)}>Sửa</button>
                                                <button
                                                    className={`btn-action ${member.is_active ? 'btn-hide' : 'btn-show'}`}
                                                    onClick={() => handleToggleActive(member)}
                                                >
                                                    {member.is_active ? 'Ẩn' : 'Hiện'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">{selectedMember ? 'Chỉnh sửa thành viên' : 'Thêm thành viên mới'}</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <form className="member-form" onSubmit={handleSave}>
                                <div className="form-group">
                                    <label className="form-label">Loại thành viên *</label>
                                    <select
                                        className="form-control"
                                        value={form.member_type}
                                        onChange={e => setForm(p => ({ ...p, member_type: e.target.value }))}
                                    >
                                        <option value={TABS.STUDENT}>Sinh viên</option>
                                        <option value={TABS.TEACHER}>Thầy cô</option>
                                    </select>
                                </div>

                                {!selectedMember && (
                                    <div className="form-group">
                                        <label className="form-label">Tên đăng nhập (để trống sẽ tự tạo)</label>
                                        <input type="text" className="form-control" value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))} placeholder="username" />
                                    </div>
                                )}
                                {!selectedMember && (
                                    <div className="form-group">
                                        <label className="form-label">Mật khẩu *</label>
                                        <input type="password" className="form-control" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="••••••••" required />
                                    </div>
                                )}
                                <div className="form-group">
                                    <label className="form-label">Họ và tên *</label>
                                    <input type="text" className="form-control" value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} placeholder="Nguyễn Văn A" required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Gmail *</label>
                                    <input type="email" className="form-control" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="email@fit.hcmus.edu.vn" required />
                                </div>

                                {form.member_type === TABS.STUDENT && (
                                    <>
                                        <div className="form-group">
                                            <label className="form-label">Mã sinh viên *</label>
                                            <input type="text" className="form-control" value={form.student_code} onChange={e => setForm(p => ({ ...p, student_code: e.target.value }))} placeholder="2212xxxx" required />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Lớp *</label>
                                            <input type="text" className="form-control" value={form.class_name} onChange={e => setForm(p => ({ ...p, class_name: e.target.value }))} placeholder="22CTT1" required />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Ban *</label>
                                            <select className="form-control" value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))}>
                                                {DEPARTMENTS.map((department) => (
                                                    <option key={department} value={department}>{department}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Chức vụ *</label>
                                            <select className="form-control" value={form.department_position} onChange={e => setForm(p => ({ ...p, department_position: e.target.value }))}>
                                                {POSITIONS.map((position) => (
                                                    <option key={position} value={position}>{position}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </>
                                )}

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
