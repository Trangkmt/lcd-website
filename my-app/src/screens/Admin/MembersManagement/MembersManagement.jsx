import React, { useState, useEffect, useRef } from 'react';
import './MembersManagement.css';
import { usersAPI, uploadsAPI } from '../../../services/api';
import { normalizeRole, ROLE_GROUPS } from '../../../utils/adminPermissions';

const TABS = {
    STUDENT: 'student',
    TEACHER: 'teacher',
};

const DEPARTMENT_OPTIONS = [
    { value: 'ban chấp hành', label: 'Ban chấp hành (BCH)' },
    { value: 'ban văn thể', label: 'Ban văn thể' },
    { value: 'ban tổ chức sự kiện', label: 'Ban tổ chức sự kiện (TCSK)' },
    { value: 'ban truyền thông kỹ thuật', label: 'Ban truyền thông kỹ thuật (TTKT)' },
    { value: 'ban công tác đoàn và phát triển đảng', label: 'Ban công tác đoàn và phát triển đảng (CTD & PTD)' },
    { value: 'ban đối ngoại', label: 'Ban đối ngoại (ĐN)' },
];

const DEPARTMENT_ALIASES = {
    bch: 'ban chấp hành',
    'ban chấp hành': 'ban chấp hành',
    'van the': 'ban văn thể',
    'văn thể': 'ban văn thể',
    'ban văn thể': 'ban văn thể',
    tcsk: 'ban tổ chức sự kiện',
    'to chuc su kien': 'ban tổ chức sự kiện',
    'tổ chức sự kiện': 'ban tổ chức sự kiện',
    'ban tổ chức sự kiện': 'ban tổ chức sự kiện',
    ttkt: 'ban truyền thông kỹ thuật',
    'truyen thong ky thuat': 'ban truyền thông kỹ thuật',
    'truyền thông kỹ thuật': 'ban truyền thông kỹ thuật',
    'ban truyền thông kỹ thuật': 'ban truyền thông kỹ thuật',
    'ctd & ptd': 'ban công tác đoàn và phát triển đảng',
    'ctd&ptd': 'ban công tác đoàn và phát triển đảng',
    ctd: 'ban công tác đoàn và phát triển đảng',
    ptd: 'ban công tác đoàn và phát triển đảng',
    'cong tac doan va phat trien dang': 'ban công tác đoàn và phát triển đảng',
    'công tác đoàn và phát triển đảng': 'ban công tác đoàn và phát triển đảng',
    'ban công tác đoàn và phát triển đảng': 'ban công tác đoàn và phát triển đảng',
    'đn': 'ban đối ngoại',
    dn: 'ban đối ngoại',
    'doi ngoai': 'ban đối ngoại',
    'đối ngoại': 'ban đối ngoại',
    'ban đối ngoại': 'ban đối ngoại',
};

const DEPARTMENT_LABEL_BY_VALUE = DEPARTMENT_OPTIONS.reduce((acc, option) => {
    acc[option.value] = option.label;
    return acc;
}, {});

function toDepartmentArray(value) {
    if (Array.isArray(value)) return value;
    if (value === null || value === undefined) return [];
    return String(value)
        .split(/[,;|]/)
        .map((item) => item.trim())
        .filter(Boolean);
}

function normalizeDepartments(value) {
    const requested = toDepartmentArray(value)
        .map((item) => {
            const raw = String(item || '').trim().toLowerCase();
            return DEPARTMENT_ALIASES[raw] || raw;
        })
        .filter(Boolean)
        .filter((item) => DEPARTMENT_LABEL_BY_VALUE[item]);

    const unique = [...new Set(requested)].slice(0, 2);
    return unique.length > 0 ? unique : [DEPARTMENT_OPTIONS[0].value];
}

function serializeDepartments(value) {
    return normalizeDepartments(value).join(', ');
}

function getDepartmentLabel(value) {
    const normalized = normalizeDepartments(value);
    return normalized
        .map((item) => DEPARTMENT_LABEL_BY_VALUE[item] || item)
        .join(', ');
}

const STUDENT_POSITIONS = ['trưởng ban', 'phó bí thư', 'phó ban', 'thành viên'];
const TEACHER_POSITIONS = ['bí thư', 'giảng viên'];
const STUDENT_DEFAULT_POSITIONS = [STUDENT_POSITIONS[STUDENT_POSITIONS.length - 1]];
const TEACHER_DEFAULT_POSITION = TEACHER_POSITIONS[TEACHER_POSITIONS.length - 1];

function getPositionOptions(memberType) {
    return memberType === TABS.TEACHER ? TEACHER_POSITIONS : STUDENT_POSITIONS;
}

function toPositionArray(value) {
    if (Array.isArray(value)) return value;
    if (value === null || value === undefined) return [];
    return String(value)
        .split(/[,;|]/)
        .map((item) => item.trim())
        .filter(Boolean);
}

const POSITION_ALIASES = {
    'pho bi thu': 'phó bí thư',
    'phó bí thư': 'phó bí thư',
    'bi thu': 'bí thư',
    'bí thư': 'bí thư',
    'giao vien': 'giảng viên',
    'giảng viên': 'giảng viên',
};

function normalizeDepartmentPosition(value, memberType) {
    const options = getPositionOptions(memberType);
    const raw = String(value || '').trim().toLowerCase();

    if (!raw) {
        return options[options.length - 1];
    }

    const mapped = POSITION_ALIASES[raw] || raw;
    const matched = options.find((option) => option.toLowerCase() === mapped);
    return matched || options[options.length - 1];
}

function normalizeStudentDepartmentPositions(value) {
    const requested = toPositionArray(value)
        .map((item) => {
            const raw = String(item || '').trim().toLowerCase();
            const mapped = POSITION_ALIASES[raw] || raw;
            return STUDENT_POSITIONS.find((option) => option.toLowerCase() === mapped) || null;
        })
        .filter(Boolean);

    const unique = [...new Set(requested)];
    return unique.length > 0 ? unique : STUDENT_DEFAULT_POSITIONS;
}

function serializeDepartmentPositions(value, memberType) {
    if (memberType === TABS.TEACHER) {
        return normalizeDepartmentPosition(value, memberType);
    }
    return normalizeStudentDepartmentPositions(value).join(', ');
}

function getDisplayDepartmentPosition(value, memberType) {
    if (memberType === TABS.TEACHER) {
        return normalizeDepartmentPosition(value, memberType);
    }
    return normalizeStudentDepartmentPositions(value).join(', ');
}

function toggleStudentPosition(currentValue, position) {
    const current = normalizeStudentDepartmentPositions(currentValue);
    const exists = current.includes(position);

    if (exists) {
        const next = current.filter((item) => item !== position);
        return next.length > 0 ? next : STUDENT_DEFAULT_POSITIONS;
    }

    return [...current, position];
}

function toggleDepartmentSelection(currentValue, department) {
    const current = normalizeDepartments(currentValue);
    if (current.includes(department)) {
        const next = current.filter((item) => item !== department);
        return next.length > 0 ? next : [DEPARTMENT_OPTIONS[0].value];
    }

    if (current.length >= 2) {
        return current;
    }

    return [...current, department];
}

const EMPTY_FORM = {
    username: '',
    password: '',
    email: '',
    full_name: '',
    avatar_url: '',
    member_type: TABS.STUDENT,
    student_code: '',
    class_name: '',
    department: [DEPARTMENT_OPTIONS[0].value],
    department_position: STUDENT_DEFAULT_POSITIONS,
    role: ROLE_GROUPS.POST_AUTHOR,
    is_active: true,
};

function inferMemberType(member) {
    if (member.member_type === TABS.TEACHER) return TABS.TEACHER;
    return TABS.STUDENT;
}

function generateUsername(email) {
    const localPart = String(email || 'user').split('@')[0] || 'user';
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `${localPart}-${randomSuffix}`;
}

function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Không đọc được file ảnh'));
        reader.readAsDataURL(file);
    });
}

const ROLE_OPTIONS = [
    { value: ROLE_GROUPS.ADMIN_FULL, label: 'Admin - Toàn quyền' },
    { value: ROLE_GROUPS.UTILITY_ONLY, label: 'Nhóm tiện ích' },
    { value: ROLE_GROUPS.POST_AUTHOR, label: 'Nhóm đăng bài' },
];

const ALL_DEPARTMENTS = 'all_departments';

export default function MembersManagement() {
    const [members, setMembers] = useState([]);
    const [activeTab, setActiveTab] = useState(TABS.STUDENT);
    const [showHidden, setShowHidden] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState(ALL_DEPARTMENTS);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [memberImageUploading, setMemberImageUploading] = useState(false);
    const memberImageInputRef = useRef(null);

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
        setForm({
            ...EMPTY_FORM,
            member_type: activeTab,
            department: [DEPARTMENT_OPTIONS[0].value],
            department_position: activeTab === TABS.TEACHER ? TEACHER_DEFAULT_POSITION : STUDENT_DEFAULT_POSITIONS,
        });
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
            avatar_url: member.avatar_url || '',
            member_type: memberType,
            student_code: member.student_code || '',
            class_name: member.class_name || '',
            department: normalizeDepartments(member.department),
            department_position: memberType === TABS.TEACHER
                ? normalizeDepartmentPosition(member.department_position, memberType)
                : normalizeStudentDepartmentPositions(member.department_position),
            role: normalizeRole(member.role),
            is_active: member.is_active !== undefined ? !!member.is_active : true,
        });
        setShowModal(true);
    }

    async function handleSave(e) {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                email: form.email,
                full_name: form.full_name,
                avatar_url: (form.avatar_url || '').trim() || null,
                role: normalizeRole(form.role),
                is_active: form.is_active,
                member_type: form.member_type,
                student_code: form.member_type === TABS.STUDENT ? form.student_code : null,
                class_name: form.member_type === TABS.STUDENT ? form.class_name : null,
                department: form.member_type === TABS.STUDENT ? serializeDepartments(form.department) : null,
                department_position: serializeDepartmentPositions(form.department_position, form.member_type),
            };

            if (!payload.full_name || !payload.email) {
                alert('Họ tên và gmail là bắt buộc');
                return;
            }

            if (payload.member_type === TABS.STUDENT && (!payload.student_code || !payload.class_name)) {
                alert('Sinh viên cần nhập mã sinh viên và lớp');
                return;
            }

            if (payload.member_type === TABS.STUDENT) {
                const selectedDepartments = normalizeDepartments(form.department);
                if (selectedDepartments.length === 0) {
                    alert('Sinh viên cần chọn ít nhất 1 ban');
                    return;
                }
                if (selectedDepartments.length > 2) {
                    alert('Chỉ được chọn tối đa 2 ban');
                    return;
                }
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
                avatar_url: member.avatar_url || null,
                role: normalizeRole(member.role),
                is_active: nextActive,
                member_type: inferMemberType(member),
                student_code: member.student_code || null,
                class_name: member.class_name || null,
                department: member.department ? serializeDepartments(normalizeDepartments(member.department)) : null,
                department_position: serializeDepartmentPositions(member.department_position, inferMemberType(member)),
            };
            const updated = await usersAPI.update(member.id, payload);
            setMembers(prev => prev.map(m => m.id === member.id ? { ...m, ...updated } : m));
        } catch (err) {
            alert('Cập nhật trạng thái thất bại: ' + err.message);
        }
    }

    function pickMemberImage() {
        memberImageInputRef.current?.click();
    }

    async function handleMemberImageUpload(event) {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            alert('Vui lòng chọn file ảnh hợp lệ.');
            return;
        }

        setMemberImageUploading(true);
        try {
            const fileData = await readFileAsDataUrl(file);
            const result = await uploadsAPI.uploadImage(fileData, 'lcd/member-avatar');
            setForm((prev) => ({ ...prev, avatar_url: result?.secure_url || '' }));
        } catch (err) {
            alert('Upload ảnh thất bại: ' + err.message);
        } finally {
            setMemberImageUploading(false);
        }
    }

    const filteredMembers = members.filter((member) => inferMemberType(member) === activeTab);
    const departmentFilteredMembers = selectedDepartment === ALL_DEPARTMENTS
        ? filteredMembers
        : filteredMembers.filter((member) => {
            if (!member.department) return false;
            return normalizeDepartments(member.department).includes(selectedDepartment);
        });
    const visibleMembers = showHidden
        ? departmentFilteredMembers
        : departmentFilteredMembers.filter((member) => !!member.is_active);

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

                <div className="department-filter">
                    <label htmlFor="department-filter" className="department-filter__label">Lọc theo ban</label>
                    <select
                        id="department-filter"
                        className="department-filter__select"
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                    >
                        <option value={ALL_DEPARTMENTS}>Tất cả ban</option>
                        {DEPARTMENT_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
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
                                    <th>Ảnh</th>
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
                                    <th>Ảnh</th>
                                    <th>Họ và tên</th>
                                    <th>Gmail</th>
                                    <th>Chức vụ</th>
                                    <th>Hành động</th>
                                </tr>
                            )}
                        </thead>
                        <tbody>
                            {visibleMembers.length === 0 && (
                                <tr>
                                    <td colSpan={isStudentTab ? 8 : 5} className="empty-cell">
                                        Chưa có thành viên phù hợp
                                    </td>
                                </tr>
                            )}

                            {visibleMembers.map((member) => (
                                isStudentTab ? (
                                    <tr key={member.id} className={!member.is_active ? 'row-hidden' : ''}>
                                        <td className="member-avatar-cell">
                                            {member.avatar_url ? (
                                                <img src={member.avatar_url} alt={member.full_name || 'Ảnh thành viên'} className="member-avatar-thumb" />
                                            ) : (
                                                <span className="member-avatar-empty">-</span>
                                            )}
                                        </td>
                                        <td>{member.full_name || '-'}</td>
                                        <td>{member.student_code || '-'}</td>
                                        <td>{member.class_name || '-'}</td>
                                        <td>{member.email || '-'}</td>
                                        <td>{member.department ? getDepartmentLabel(member.department) : '-'}</td>
                                        <td>{getDisplayDepartmentPosition(member.department_position, TABS.STUDENT)}</td>
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
                                        <td className="member-avatar-cell">
                                            {member.avatar_url ? (
                                                <img src={member.avatar_url} alt={member.full_name || 'Ảnh thành viên'} className="member-avatar-thumb" />
                                            ) : (
                                                <span className="member-avatar-empty">-</span>
                                            )}
                                        </td>
                                        <td>{member.full_name || '-'}</td>
                                        <td>{member.email || '-'}</td>
                                        <td>{getDisplayDepartmentPosition(member.department_position, TABS.TEACHER)}</td>
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
                                        onChange={e => setForm((p) => {
                                            const nextType = e.target.value;
                                            return {
                                                ...p,
                                                member_type: nextType,
                                                department_position: nextType === TABS.TEACHER ? TEACHER_DEFAULT_POSITION : STUDENT_DEFAULT_POSITIONS,
                                            };
                                        })}
                                    >
                                        <option value={TABS.STUDENT}>Sinh viên</option>
                                        <option value={TABS.TEACHER}>Thầy cô</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Nhóm phân quyền *</label>
                                    <select
                                        className="form-control"
                                        value={form.role}
                                        onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                                    >
                                        {ROLE_OPTIONS.map((option) => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
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
                                <div className="form-group">
                                    <label className="form-label">Ảnh thành viên</label>
                                    <div className="member-image-uploader">
                                        <button
                                            type="button"
                                            className="btn-secondary"
                                            onClick={pickMemberImage}
                                            disabled={memberImageUploading}
                                        >
                                            {memberImageUploading ? 'Đang upload...' : 'Chọn ảnh'}
                                        </button>
                                        <input
                                            ref={memberImageInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleMemberImageUpload}
                                            style={{ display: 'none' }}
                                        />
                                        {form.avatar_url && (
                                            <button
                                                type="button"
                                                className="btn-link-danger"
                                                onClick={() => setForm((p) => ({ ...p, avatar_url: '' }))}
                                            >
                                                Xóa ảnh
                                            </button>
                                        )}
                                    </div>
                                    {form.avatar_url && (
                                        <div className="member-image-preview-wrap">
                                            <img src={form.avatar_url} alt="Ảnh thành viên" className="member-image-preview" />
                                        </div>
                                    )}
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
                                            <label className="form-label">Ban * (chọn tối đa 2)</label>
                                            <div className="department-checkboxes" role="group" aria-label="Chọn ban cho sinh viên">
                                                {DEPARTMENT_OPTIONS.map((department) => (
                                                    <label key={department.value} className="department-checkbox-item">
                                                        <input
                                                            type="checkbox"
                                                            checked={normalizeDepartments(form.department).includes(department.value)}
                                                            onChange={() => setForm((p) => ({
                                                                ...p,
                                                                department: toggleDepartmentSelection(p.department, department.value),
                                                            }))}
                                                        />
                                                        <span>{department.label}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Chức vụ * (chọn 1 hoặc nhiều)</label>
                                            <div className="position-checkboxes" role="group" aria-label="Chọn chức vụ sinh viên">
                                                {STUDENT_POSITIONS.map((position) => {
                                                    const checkedPositions = Array.isArray(form.department_position)
                                                        ? form.department_position
                                                        : normalizeStudentDepartmentPositions(form.department_position);
                                                    const checked = checkedPositions.includes(position);

                                                    return (
                                                        <label key={position} className="position-checkbox-item">
                                                            <input
                                                                type="checkbox"
                                                                checked={checked}
                                                                onChange={() => setForm((p) => ({
                                                                    ...p,
                                                                    department_position: toggleStudentPosition(p.department_position, position),
                                                                }))}
                                                            />
                                                            <span>{position}</span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </>
                                )}

                                {form.member_type === TABS.TEACHER && (
                                    <div className="form-group">
                                        <label className="form-label">Chức vụ *</label>
                                        <select className="form-control" value={form.department_position} onChange={e => setForm(p => ({ ...p, department_position: e.target.value }))}>
                                            {TEACHER_POSITIONS.map((position) => (
                                                <option key={position} value={position}>{position}</option>
                                            ))}
                                        </select>
                                    </div>
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
