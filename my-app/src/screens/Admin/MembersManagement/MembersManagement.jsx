import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import './MembersManagement.css';
import { SearchBar } from '../../../components';
import { usersAPI, uploadsAPI, teamsAPI } from '../../../services/api';
import { normalizeRole, ROLE_GROUPS } from '../../../utils/adminPermissions';
import { PlusIcon, EditIcon, HideIcon, ShowIcon, CloseIcon } from '../../../SvgIcons';
import useAdminConfirm from '../useAdminConfirm';

const CSV_HEADERS = ['Họ và tên', 'Mã sinh viên', 'Lớp', 'Gmail', 'Ban', 'Chức vụ'];

const TABS = {
    STUDENT: 'student',
    TEACHER: 'teacher',
};

const EMPTY_FORM = {

    username: '',
    password: '',
    email: '',
    full_name: '',
    avatar_url: '',
    member_type: TABS.STUDENT,
    student_code: '',
    class_name: '',
    teams: [],
    role: ROLE_GROUPS.POST_AUTHOR,
    is_active: true,
};

function inferMemberType(member) {
    if (member.member_type === TABS.TEACHER) return TABS.TEACHER;
    return TABS.STUDENT;
}

function generateUsername(email) {
    return String(email || 'user').split('@')[0] || 'user';
}

function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Không đọc được file ảnh'));
        reader.readAsDataURL(file);
    });
}

function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(new Error('Không đọc được file CSV'));
        reader.readAsText(file, 'utf-8');
    });
}

function normalizeCsvHeader(value) {
    return String(value || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function normalizeSearchText(value) {
    return String(value || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .trim();
}

function parseCsvLine(line, delimiter = ',') {
    const fields = [];
    let current = '';
    let inQuotes = false;

    for (let index = 0; index < line.length; index += 1) {
        const char = line[index];
        const nextChar = line[index + 1];

        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                current += '"';
                index += 1;
            } else {
                inQuotes = !inQuotes;
            }
            continue;
        }

        if (char === delimiter && !inQuotes) {
            fields.push(current.trim());
            current = '';
            continue;
        }

        current += char;
    }

    fields.push(current.trim());
    return fields;
}

function parseCsvContent(content) {
    const cleaned = String(content || '').replace(/^\uFEFF/, '');
    const lines = cleaned
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

    if (lines.length < 2) return [];

    const firstLine = lines[0];
    const delimiterCandidates = [',', ';', '\t'];
    const bestDelimiter = delimiterCandidates
        .map((delimiter) => ({ delimiter, columns: parseCsvLine(firstLine, delimiter).length }))
        .sort((a, b) => b.columns - a.columns)[0].delimiter;

    const headers = parseCsvLine(firstLine, bestDelimiter).map(normalizeCsvHeader);
    const parsedRows = [];

    for (let lineIndex = 1; lineIndex < lines.length; lineIndex += 1) {
        const values = parseCsvLine(lines[lineIndex], bestDelimiter);
        const row = {};

        headers.forEach((header, headerIndex) => {
            row[header] = values[headerIndex] || '';
        });

        parsedRows.push(row);
    }

    return parsedRows;
}

function csvEscape(value) {
    const raw = String(value === null || value === undefined ? '' : value);
    if (raw.includes('"') || raw.includes(',') || raw.includes('\n')) {
        return `"${raw.replace(/"/g, '""')}"`;
    }
    return raw;
}

function downloadCsvFile(filename, rows) {
    const content = rows.map((row) => row.map(csvEscape).join(',')).join('\n');
    const blob = new Blob([`\uFEFF${content}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

const ROLE_OPTIONS = [
    { value: ROLE_GROUPS.ADMIN_FULL, label: 'Admin - Toàn quyền' },
    { value: ROLE_GROUPS.UTILITY_ONLY, label: 'Nhóm tiện ích' },
    { value: ROLE_GROUPS.POST_AUTHOR, label: 'Nhóm đăng bài' },
];

const ALL_DEPARTMENTS = 'all_departments';
const ALL_STUDENT_POSITIONS = 'all_student_positions';
const BULK_NO_CHANGE = '__bulk_no_change__';
const BULK_STATUS_ACTIVE = 'active';
const BULK_STATUS_HIDDEN = 'hidden';

const STUDENT_POSITIONS = ['Thành viên', 'Phó ban', 'Trưởng ban', 'Bí thư', 'Phó bí thư'];
const TEACHER_POSITIONS = ['Cố vấn', 'Trưởng bộ môn', 'Giáo viên', 'Bí thư'];

export default function MembersManagement() {
    const { confirm, confirmModal } = useAdminConfirm();
    const location = useLocation();
    const [members, setMembers] = useState([]);
    const [teams, setTeams] = useState([]);
    const [showHidden, setShowHidden] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState(ALL_DEPARTMENTS);
    const [selectedStudentPosition, setSelectedStudentPosition] = useState(ALL_STUDENT_POSITIONS);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [selectedMemberIds, setSelectedMemberIds] = useState([]);
    const [bulkDepartment, setBulkDepartment] = useState(BULK_NO_CHANGE);
    const [bulkPosition, setBulkPosition] = useState(BULK_NO_CHANGE);
    const [bulkStatus, setBulkStatus] = useState(BULK_NO_CHANGE);
    const [bulkRole, setBulkRole] = useState(BULK_NO_CHANGE);
    const [bulkUpdating, setBulkUpdating] = useState(false);
    const [csvImporting, setCsvImporting] = useState(false);
    const [memberImageUploading, setMemberImageUploading] = useState(false);
    const memberImageInputRef = useRef(null);
    const csvInputRef = useRef(null);
    const activeTab = (() => {
        const tab = new URLSearchParams(location.search).get('tab');
        return tab === TABS.TEACHER ? TABS.TEACHER : TABS.STUDENT;
    })();

    useEffect(() => {
        fetchMembers();
        fetchTeams();
    }, []);

    async function fetchTeams() {
        try {
            const data = await teamsAPI.getAll();
            setTeams(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Lỗi lấy danh sách ban:', err);
        }
    }

    const getTeamName = (teamId) => {
        const team = teams.find(t => t.id === teamId);
        return team ? team.name : '-';
    };

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
            teams: [],
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
            teams: Array.isArray(member.teams) ? member.teams : [],
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
                teams: form.teams || [],
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
                if (!form.teams || form.teams.length === 0) {
                    alert('Sinh viên cần chọn ít nhất 1 ban');
                    return;
                }
                if (form.teams.length > 2) {
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
        const confirmed = await confirm({
            title: nextActive ? 'Xác nhận hiển thị' : 'Xác nhận ẩn',
            message: confirmText,
            detail: nextActive
                ? 'Thành viên sẽ hiển thị trở lại trong danh sách.'
                : 'Thành viên sẽ được ẩn khỏi danh sách hiển thị.',
            variant: nextActive ? 'info' : 'delete',
            confirmText: nextActive ? 'Hiện thành viên' : 'Ẩn thành viên',
            confirmButtonClassName: nextActive ? 'btn-primary' : 'btn-action btn-delete',
        });
        if (!confirmed) return;

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
                teams: member.teams || [],
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

    function downloadCsvTemplate() {
        const rows = [
            CSV_HEADERS,
            ['Nguyễn Văn A', '22120001', '22CTT1', '22120001@fit.hcmus.edu.vn', 'Ban truyền thông kỹ thuật', 'Thành viên'],
            ['Trần Thị B', '22120002', '22CTT2', '22120002@fit.hcmus.edu.vn', 'Ban tổ chức sự kiện', 'Phó ban'],
        ];
        downloadCsvFile('members-import-template.csv', rows);
    }

    function exportMembersCsv() {
        const rows = [CSV_HEADERS];
        
        visibleMembers.forEach(member => {
            const memberType = inferMemberType(member);
            const matchingTeams = (member.teams || []).filter(t => {
                const teamIdMatch = selectedDepartment === ALL_DEPARTMENTS || String(t.team_id) === String(selectedDepartment);
                const positionMatch = selectedStudentPosition === ALL_STUDENT_POSITIONS || t.team_position === selectedStudentPosition;
                return teamIdMatch && positionMatch;
            });

            const assignments = matchingTeams.length > 0 ? matchingTeams : [{ team_id: null, team_position: member.role === 'admin_full' ? 'Admin' : 'Thành viên' }];
            
            assignments.forEach((t, idx) => {
                const isFirst = idx === 0;
                rows.push([
                    isFirst ? (member.full_name || '') : '',
                    isFirst ? (memberType === TABS.STUDENT ? (member.student_code || '') : '') : '',
                    isFirst ? (memberType === TABS.STUDENT ? (member.class_name || '') : '') : '',
                    isFirst ? (member.email || '') : '',
                    memberType === TABS.STUDENT ? (t.team_name || getTeamName(t.team_id)) : '',
                    t.team_position || '',
                ]);
            });
        });

        const fileSuffix = activeTab === TABS.STUDENT ? 'students' : 'teachers';
        downloadCsvFile(`members-${fileSuffix}.csv`, rows);
    }

    function triggerCsvImport() {
        csvInputRef.current?.click();
    }

    function getCsvValue(row, candidates) {
        for (const header of candidates) {
            const normalized = normalizeCsvHeader(header);
            if (row[normalized] !== undefined) {
                return String(row[normalized] || '').trim();
            }
        }
        return '';
    }

    async function handleCsvImport(event) {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;

        try {
            setCsvImporting(true);

            const content = await readFileAsText(file);
            const parsedRows = parseCsvContent(content);

            if (parsedRows.length === 0) {
                alert('File CSV không có dữ liệu hợp lệ.');
                return;
            }

            const existingMembers = Array.isArray(members) ? members : [];
            let successCount = 0;
            let failedCount = 0;
            const failedRows = [];

            for (let rowIndex = 0; rowIndex < parsedRows.length; rowIndex += 1) {
                const row = parsedRows[rowIndex];
                const fullName = getCsvValue(row, ['Họ và tên', 'Ho va ten', 'Full name']);
                const studentCode = getCsvValue(row, ['Mã sinh viên', 'Ma sinh vien', 'Student code']);
                const className = getCsvValue(row, ['Lớp', 'Lop', 'Class']);
                const email = getCsvValue(row, ['Gmail', 'Email']);
                const teamRaw = getCsvValue(row, ['Ban', 'Department']);
const matchedTeam = teams.find(t => t.name.toLowerCase().includes(teamRaw.toLowerCase()) || (t.name_abbr || '').toLowerCase().includes(teamRaw.toLowerCase()));
const team_id = matchedTeam ? matchedTeam.id : null;
                const positionRaw = getCsvValue(row, ['Chức vụ', 'Chuc vu', 'Position']);

                if (!fullName || !email) {
                    failedCount += 1;
                    failedRows.push(`Dòng ${rowIndex + 2}: thiếu Họ và tên hoặc Gmail`);
                    continue;
                }

                const memberType = studentCode || className || teamRaw ? TABS.STUDENT : TABS.TEACHER;

                if (memberType === TABS.STUDENT && (!studentCode || !className || !teamRaw || !positionRaw)) {
                    failedCount += 1;
                    failedRows.push(`Dòng ${rowIndex + 2}: sinh viên cần đủ Mã sinh viên, Lớp, Ban, Chức vụ`);
                    continue;
                }

                

                const payload = {
                    email,
                    full_name: fullName,
                    avatar_url: null,
                    role: ROLE_GROUPS.UTILITY_ONLY,
                    is_active: true,
                    member_type: memberType,
                    student_code: memberType === TABS.STUDENT ? studentCode : null,
                    class_name: memberType === TABS.STUDENT ? className : null,
                    teams: memberType === TABS.STUDENT && team_id ? [{ team_id, team_position: positionRaw }] : [],
                };

                const existing = existingMembers.find((member) => {
                    const sameStudentCode = memberType === TABS.STUDENT
                        && !!studentCode
                        && String(member.student_code || '').trim().toLowerCase() === studentCode.toLowerCase();
                    const sameEmail = String(member.email || '').trim().toLowerCase() === email.toLowerCase();
                    return sameStudentCode || sameEmail;
                });

                try {
                    if (existing) {
                        await usersAPI.update(existing.id, {
                            ...payload,
                            avatar_url: existing.avatar_url || null,
                            role: normalizeRole(existing.role),
                        });
                    } else {
                        await usersAPI.create({
                            username: generateUsername(email),
                            password: studentCode || '12345678',
                            ...payload,
                        });
                    }
                    successCount += 1;
                } catch (err) {
                    failedCount += 1;
                    failedRows.push(`Dòng ${rowIndex + 2}: ${err.message}`);
                }
            }

            await fetchMembers();

            const failPreview = failedRows.slice(0, 5).join('\n');
            alert(
                `Nhập CSV hoàn tất. Thành công: ${successCount}, Thất bại: ${failedCount}`
                + (failPreview ? `\n\nChi tiết lỗi:\n${failPreview}` : '')
            );
        } catch (err) {
            alert(`Nhập CSV thất bại: ${err.message}`);
        } finally {
            setCsvImporting(false);
        }
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

    function toggleMemberSelection(memberId) {
        setSelectedMemberIds((prev) => (
            prev.includes(memberId)
                ? prev.filter((id) => id !== memberId)
                : [...prev, memberId]
        ));
    }

    function toggleSelectAllVisible(checked, visibleIds) {
        setSelectedMemberIds((prev) => {
            const prevSet = new Set(prev);
            if (checked) {
                visibleIds.forEach((id) => prevSet.add(id));
            } else {
                visibleIds.forEach((id) => prevSet.delete(id));
            }
            return Array.from(prevSet);
        });
    }

    function resetBulkControls() {
        setBulkDepartment(BULK_NO_CHANGE);
        setBulkPosition(BULK_NO_CHANGE);
        setBulkStatus(BULK_NO_CHANGE);
        setBulkRole(BULK_NO_CHANGE);
    }

    async function applyBulkUpdate(selectedMembers) {
        if (!selectedMembers.length) {
            alert('Vui lòng chọn ít nhất 1 thành viên.');
            return;
        }

        if (
            bulkDepartment === BULK_NO_CHANGE
            && bulkPosition === BULK_NO_CHANGE
            && bulkStatus === BULK_NO_CHANGE
            && bulkRole === BULK_NO_CHANGE
        ) {
            alert('Vui lòng chọn ít nhất 1 trường cần cập nhật hàng loạt.');
            return;
        }

        setBulkUpdating(true);
        let successCount = 0;
        let failedCount = 0;

        try {
            for (const member of selectedMembers) {
                const memberType = inferMemberType(member);

                const nextDepartment = memberType === TABS.STUDENT
                    ? (
                        bulkDepartment !== BULK_NO_CHANGE
                            ? serializeDepartments([bulkDepartment])
                            : (member.department ? serializeDepartments(normalizeDepartments(member.department)) : null)
                    )
                    : null;

                const nextPosition = bulkPosition !== BULK_NO_CHANGE
                    ? serializeDepartmentPositions(bulkPosition, memberType, member.department)
                    : serializeDepartmentPositions(member.department_position, memberType, member.department);

                const nextStatus = bulkStatus === BULK_NO_CHANGE
                    ? !!member.is_active
                    : bulkStatus === BULK_STATUS_ACTIVE;

                const payload = {
                    email: member.email,
                    full_name: member.full_name,
                    avatar_url: member.avatar_url || null,
                    role: bulkRole !== BULK_NO_CHANGE ? normalizeRole(bulkRole) : normalizeRole(member.role),
                    is_active: nextStatus,
                    member_type: memberType,
                    student_code: memberType === TABS.STUDENT ? (member.student_code || null) : null,
                    class_name: memberType === TABS.STUDENT ? (member.class_name || null) : null,
                    teams: memberType === TABS.STUDENT && bulkDepartment !== BULK_NO_CHANGE
                        ? [{ team_id: parseInt(bulkDepartment), team_position: bulkPosition !== BULK_NO_CHANGE ? bulkPosition : 'Thành viên' }]
                        : member.teams,
                };

                try {
                    await usersAPI.update(member.id, payload);
                    successCount += 1;
                } catch (err) {
                    failedCount += 1;
                }
            }

            await fetchMembers();
            setSelectedMemberIds([]);
            resetBulkControls();
            alert(`Cập nhật hàng loạt hoàn tất. Thành công: ${successCount}, Thất bại: ${failedCount}`);
        } finally {
            setBulkUpdating(false);
        }
    }

    async function handleBulkHide(selectedMembers) {
        if (!selectedMembers.length) {
            alert('Vui lòng chọn ít nhất 1 thành viên.');
            return;
        }

        const confirmed = await confirm({
            title: 'Xác nhận ẩn hàng loạt',
            message: `Bạn có chắc muốn ẩn ${selectedMembers.length} thành viên đã chọn không?`,
            detail: 'Các thành viên đã chọn sẽ được chuyển sang trạng thái ẩn.',
            variant: 'delete',
            confirmText: 'Ẩn thành viên',
            confirmButtonClassName: 'btn-action btn-delete',
        });
        if (!confirmed) {
            return;
        }

        setBulkUpdating(true);
        let successCount = 0;
        let failedCount = 0;

        try {
            for (const member of selectedMembers) {
                const memberType = inferMemberType(member);
                const payload = {
                    email: member.email,
                    full_name: member.full_name,
                    avatar_url: member.avatar_url || null,
                    role: normalizeRole(member.role),
                    is_active: false,
                    member_type: memberType,
                    student_code: memberType === TABS.STUDENT ? (member.student_code || null) : null,
                    class_name: memberType === TABS.STUDENT ? (member.class_name || null) : null,
                    teams: member.teams || [],
                };

                try {
                    await usersAPI.update(member.id, payload);
                    successCount += 1;
                } catch (err) {
                    failedCount += 1;
                }
            }

            await fetchMembers();
            setSelectedMemberIds([]);
            alert(`Ẩn hàng loạt hoàn tất. Thành công: ${successCount}, Thất bại: ${failedCount}`);
        } finally {
            setBulkUpdating(false);
        }
    }

    const filteredMembers = members.filter((member) => inferMemberType(member) === activeTab);
    const normalizedSearchQuery = normalizeSearchText(searchQuery);
    const searchedMembers = normalizedSearchQuery
        ? filteredMembers.filter((member) => {
            const memberType = inferMemberType(member);
            const teamsList = Array.isArray(member.teams) ? member.teams : [];
            
            const searchableFields = [
                member.full_name,
                member.email,
                memberType === TABS.STUDENT ? member.student_code : '',
                memberType === TABS.STUDENT ? member.class_name : '',
                ...teamsList.map(t => getTeamName(t.team_id)),
                ...teamsList.map(t => t.team_position),
            ];

            return searchableFields.some((field) => normalizeSearchText(field).includes(normalizedSearchQuery));
        })
        : filteredMembers;

    const departmentFilteredMembers = activeTab === TABS.TEACHER
        ? searchedMembers
        : selectedDepartment === ALL_DEPARTMENTS
            ? searchedMembers
            : searchedMembers.filter((member) => {
                if (!member.teams || !Array.isArray(member.teams)) return false;
                return member.teams.some(t => String(t.team_id) === String(selectedDepartment));
            });
    const positionFilteredMembers = activeTab === TABS.TEACHER
        ? departmentFilteredMembers
        : selectedStudentPosition === ALL_STUDENT_POSITIONS
            ? departmentFilteredMembers
            : departmentFilteredMembers.filter((member) => {
                if (!member.teams || !Array.isArray(member.teams)) return false;
                return member.teams.some(t => t.team_position === selectedStudentPosition);
            });

    const visibleMembers = showHidden
        ? positionFilteredMembers
        : positionFilteredMembers.filter((member) => !!member.is_active);

    const visibleMemberIds = visibleMembers
        .map((member) => member.id)
        .filter((id) => id !== undefined && id !== null);
    const selectedVisibleMembers = visibleMembers.filter((member) => selectedMemberIds.includes(member.id));
    const isAllVisibleSelected = visibleMemberIds.length > 0 && visibleMemberIds.every((id) => selectedMemberIds.includes(id));
    const isSomeVisibleSelected = visibleMemberIds.some((id) => selectedMemberIds.includes(id));

    useEffect(() => {
        const visibleIdSet = new Set(visibleMemberIds);
        setSelectedMemberIds((prev) => prev.filter((id) => visibleIdSet.has(id)));
    }, [activeTab, showHidden, selectedDepartment, selectedStudentPosition, members]);

    const isStudentTab = activeTab === TABS.STUDENT;
    const pageTitle = isStudentTab ? 'Danh sách Sinh viên' : 'Danh sách Thầy cô';

    return (
        <div className="members-management">
            <div className="page-header">
                <div className="header-content">
                    <h1 className="page-title">{pageTitle}</h1>
                </div>
                <div className="members-header-actions">
                    <button type="button" className="btn-secondary" onClick={downloadCsvTemplate}>Tải CSV mẫu</button>
                    <button type="button" className="btn-secondary" onClick={exportMembersCsv}>Xuất CSV</button>
                    <button type="button" className="btn-secondary" onClick={triggerCsvImport} disabled={csvImporting}>
                        {csvImporting ? 'Đang nhập...' : 'Nhập CSV'}
                    </button>
                    <input
                        ref={csvInputRef}
                        type="file"
                        accept=".csv,text/csv"
                        onChange={handleCsvImport}
                        style={{ display: 'none' }}
                    />
                    <button className="btn-primary" onClick={openCreate}>
                        <span className="btn-icon" aria-hidden="true"><PlusIcon /></span>
                        Thêm thành viên mới
                    </button>
                </div>
            </div>

            <div className="members-toolbar">
                <SearchBar
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onClear={() => setSearchQuery('')}
                    placeholder={isStudentTab ? 'Tìm theo tên, email, mã SV, lớp, ban, chức vụ...' : 'Tìm theo tên, email, chức vụ...'}
                    variant="toolbar"
                />

                {isStudentTab && (
                    <>
                        <div className="department-filter">
                            <label htmlFor="department-filter" className="department-filter__label">Lọc theo ban</label>
                            <select
                                id="department-filter"
                                className="department-filter__select"
                                value={selectedDepartment}
                                onChange={(e) => setSelectedDepartment(e.target.value)}
                            >
                                <option value={ALL_DEPARTMENTS}>Tất cả ban</option>
                                {teams.map((team) => (
                                    <option key={team.id} value={team.id}>{team.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="position-filter">
                            <label htmlFor="position-filter" className="position-filter__label">Lọc theo chức vụ</label>
                            <select
                                id="position-filter"
                                className="position-filter__select"
                                value={selectedStudentPosition}
                                onChange={(e) => setSelectedStudentPosition(e.target.value)}
                            >
                                <option value={ALL_STUDENT_POSITIONS}>Tất cả chức vụ</option>
                                {STUDENT_POSITIONS.map((position) => (
                                    <option key={position} value={position}>{position}</option>
                                ))}
                            </select>
                        </div>
                    </>
                )}

                <label className="toggle-hidden">
                    <input
                        type="checkbox"
                        checked={showHidden}
                        onChange={(e) => setShowHidden(e.target.checked)}
                    />
                    <span>Hiển thị thành viên đã ẩn</span>
                </label>
            </div>

            {selectedVisibleMembers.length > 0 && (
                <div className="members-bulk-toolbar">
                    {isStudentTab && (
                        <select
                            className="members-bulk-toolbar__select"
                            value={bulkDepartment}
                            onChange={(e) => setBulkDepartment(e.target.value)}
                        >
                            <option value={BULK_NO_CHANGE}>Ban: Không đổi</option>
                            {teams.map((team) => (
                                <option key={team.id} value={team.id}>{team.name}</option>
                            ))}
                        </select>
                    )}

                    <select
                        className="members-bulk-toolbar__select"
                        value={bulkPosition}
                        onChange={(e) => setBulkPosition(e.target.value)}
                    >
                        <option value={BULK_NO_CHANGE}>Chức vụ: Không đổi</option>
                        {(isStudentTab ? STUDENT_POSITIONS : TEACHER_POSITIONS).map((position) => (
                            <option key={position} value={position}>{position}</option>
                        ))}
                    </select>

                    <select
                        className="members-bulk-toolbar__select"
                        value={bulkStatus}
                        onChange={(e) => setBulkStatus(e.target.value)}
                    >
                        <option value={BULK_NO_CHANGE}>Trạng thái: Không đổi</option>
                        <option value={BULK_STATUS_ACTIVE}>Đang hoạt động</option>
                        <option value={BULK_STATUS_HIDDEN}>Đã ẩn</option>
                    </select>

                    <select
                        className="members-bulk-toolbar__select"
                        value={bulkRole}
                        onChange={(e) => setBulkRole(e.target.value)}
                    >
                        <option value={BULK_NO_CHANGE}>Role: Không đổi</option>
                        {ROLE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>

                    <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => applyBulkUpdate(selectedVisibleMembers)}
                        disabled={bulkUpdating}
                    >
                        {bulkUpdating ? 'Đang cập nhật...' : `Cập nhật hàng loạt (${selectedVisibleMembers.length})`}
                    </button>

                    <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => handleBulkHide(selectedVisibleMembers)}
                        disabled={bulkUpdating}
                    >
                        Ẩn hàng loạt
                    </button>

                    <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => setSelectedMemberIds([])}
                        disabled={bulkUpdating}
                    >
                        Bỏ chọn
                    </button>
                </div>
            )}

            {loading ? (
                <p className="loading-text">Đang tải...</p>
            ) : (
                <div className="table-wrapper">
                    <table className="members-table">
                        <thead>
                            {isStudentTab ? (
                                <tr>
                                    <th className="select-col">
                                        <input
                                            type="checkbox"
                                            checked={isAllVisibleSelected}
                                            ref={(el) => {
                                                if (el) el.indeterminate = !isAllVisibleSelected && isSomeVisibleSelected;
                                            }}
                                            onChange={(e) => toggleSelectAllVisible(e.target.checked, visibleMemberIds)}
                                            aria-label="Chọn tất cả thành viên hiển thị"
                                        />
                                    </th>
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
                                    <th className="select-col">
                                        <input
                                            type="checkbox"
                                            checked={isAllVisibleSelected}
                                            ref={(el) => {
                                                if (el) el.indeterminate = !isAllVisibleSelected && isSomeVisibleSelected;
                                            }}
                                            onChange={(e) => toggleSelectAllVisible(e.target.checked, visibleMemberIds)}
                                            aria-label="Chọn tất cả thành viên hiển thị"
                                        />
                                    </th>
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
                                    <td colSpan={isStudentTab ? 9 : 6} className="empty-cell">
                                        Chưa có thành viên phù hợp
                                    </td>
                                </tr>
                            )}

                            {visibleMembers.map((member) => {
                                const matchingTeams = (member.teams || []).filter(t => {
                                    const teamIdMatch = selectedDepartment === ALL_DEPARTMENTS || String(t.team_id) === String(selectedDepartment);
                                    const positionMatch = selectedStudentPosition === ALL_STUDENT_POSITIONS || t.team_position === selectedStudentPosition;
                                    return teamIdMatch && positionMatch;
                                });

                                const rows = matchingTeams.length > 0 ? matchingTeams : [{ team_id: null, team_position: member.role === 'admin_full' ? 'Admin' : 'Thành viên' }];
                                const rowCount = rows.length;

                                return rows.map((t, idx) => (
                                    isStudentTab ? (
                                        <tr key={`${member.id}-${t.team_id || idx}`} className={!member.is_active ? 'row-hidden' : ''}>
                                            {idx === 0 && (
                                                <>
                                                    <td rowSpan={rowCount} className="select-col">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedMemberIds.includes(member.id)}
                                                            onChange={() => toggleMemberSelection(member.id)}
                                                            aria-label={`Chọn ${member.full_name || 'thành viên'}`}
                                                        />
                                                    </td>
                                                    <td rowSpan={rowCount} className="member-avatar-cell">
                                                        {member.avatar_url ? (
                                                            <img src={member.avatar_url} alt={member.full_name || 'Ảnh thành viên'} className="member-avatar-thumb" />
                                                        ) : (
                                                            <span className="member-avatar-empty">-</span>
                                                        )}
                                                    </td>
                                                    <td rowSpan={rowCount}>{member.full_name || '-'}</td>
                                                    <td rowSpan={rowCount}>{member.student_code || '-'}</td>
                                                    <td rowSpan={rowCount}>{member.class_name || '-'}</td>
                                                    <td rowSpan={rowCount}>{member.email || '-'}</td>
                                                </>
                                            )}
                                            <td className="member-department-cell">
                                                {t.team_name || getTeamName(t.team_id)}
                                            </td>
                                            <td className="member-position-cell">
                                                {t.team_position}
                                            </td>
                                            {idx === 0 && (
                                                <td rowSpan={rowCount}>
                                                    <div className="row-actions">
                                                        <button
                                                            className="btn-action btn-edit btn-action--icon-only"
                                                            onClick={() => openEdit(member)}
                                                            title="Sửa thành viên"
                                                            aria-label="Sửa thành viên"
                                                        >
                                                            <span className="btn-action-icon" aria-hidden="true"><EditIcon /></span>
                                                        </button>
                                                        <button
                                                            className={`btn-action btn-action--icon-only ${member.is_active ? 'btn-hide' : 'btn-show'}`}
                                                            onClick={() => handleToggleActive(member)}
                                                            title={member.is_active ? 'Ẩn thành viên' : 'Hiện thành viên'}
                                                            aria-label={member.is_active ? 'Ẩn thành viên' : 'Hiện thành viên'}
                                                        >
                                                            <span className="btn-action-icon" aria-hidden="true">
                                                                {member.is_active ? <HideIcon /> : <ShowIcon />}
                                                            </span>
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ) : (
                                        <tr key={`${member.id}-${t.team_id || idx}`} className={!member.is_active ? 'row-hidden' : ''}>
                                            {idx === 0 && (
                                                <>
                                                    <td rowSpan={rowCount} className="select-col">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedMemberIds.includes(member.id)}
                                                            onChange={() => toggleMemberSelection(member.id)}
                                                            aria-label={`Chọn ${member.full_name || 'thành viên'}`}
                                                        />
                                                    </td>
                                                    <td rowSpan={rowCount} className="member-avatar-cell">
                                                        {member.avatar_url ? (
                                                            <img src={member.avatar_url} alt={member.full_name || 'Ảnh thành viên'} className="member-avatar-thumb" />
                                                        ) : (
                                                            <span className="member-avatar-empty">-</span>
                                                        )}
                                                    </td>
                                                    <td rowSpan={rowCount}>{member.full_name || '-'}</td>
                                                    <td rowSpan={rowCount}>{member.email || '-'}</td>
                                                </>
                                            )}
                                            <td className="member-position-cell">
                                                {t.team_position}
                                            </td>
                                            {idx === 0 && (
                                                <td rowSpan={rowCount}>
                                                    <div className="row-actions">
                                                        <button
                                                            className="btn-action btn-edit btn-action--icon-only"
                                                            onClick={() => openEdit(member)}
                                                            title="Sửa thành viên"
                                                            aria-label="Sửa thành viên"
                                                        >
                                                            <span className="btn-action-icon" aria-hidden="true"><EditIcon /></span>
                                                        </button>
                                                        <button
                                                            className={`btn-action btn-action--icon-only ${member.is_active ? 'btn-hide' : 'btn-show'}`}
                                                            onClick={() => handleToggleActive(member)}
                                                            title={member.is_active ? 'Ẩn thành viên' : 'Hiện thành viên'}
                                                            aria-label={member.is_active ? 'Ẩn thành viên' : 'Hiện thành viên'}
                                                        >
                                                            <span className="btn-action-icon" aria-hidden="true">
                                                                {member.is_active ? <HideIcon /> : <ShowIcon />}
                                                            </span>
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    )
                                ));
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div className="admin-modal" role="dialog" aria-modal="true" aria-label={selectedMember ? 'Chỉnh sửa thành viên' : 'Thêm thành viên mới'}>
                    <div className="admin-modal__backdrop" onClick={() => setShowModal(false)} />
                    <section className="admin-modal__panel">
                        <div className="admin-modal__header">
                            <h2 className="admin-modal__title">{selectedMember ? 'Chỉnh sửa thành viên' : 'Thêm thành viên mới'}</h2>
                            <button className="admin-modal__close" onClick={() => setShowModal(false)} aria-label="Đóng">
                                <CloseIcon />
                            </button>
                        </div>
                        <div className="admin-modal__body">
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
                                                teams: [],
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
                                                {teams.map((team) => (
                                                    <label key={team.id} className="department-checkbox-item">
                                                        <input
                                                            type="checkbox"
                                                            checked={form.teams.some(t => t.team_id === team.id)}
                                                            onChange={(e) => {
                                                                setForm(p => {
                                                                    let nextTeams = [...p.teams];
                                                                    if (e.target.checked) {
                                                                        if (nextTeams.length < 2) nextTeams.push({ team_id: team.id, team_position: 'Thành viên' });
                                                                        else alert('Sinh viên chỉ được tham gia tối đa 2 ban');
                                                                    } else {
                                                                        nextTeams = nextTeams.filter(t => t.team_id !== team.id);
                                                                    }
                                                                    return { ...p, teams: nextTeams };
                                                                });
                                                            }}
                                                        />
                                                        <span>{team.name}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Chức vụ theo từng ban * (mỗi ban chọn 1)</label>
                                            <div className="department-position-groups" role="group" aria-label="Chọn chức vụ theo từng ban">
                                                {form.teams.map(tForm => {
                                                    const teamInfo = teams.find(t => t.id === tForm.team_id);
                                                    if (!teamInfo) return null;
                                                    return (
                                                        <div key={teamInfo.id} className="department-position-group">
                                                            <p className="department-position-group__title">{teamInfo.name}</p>
                                                            <div className="position-checkboxes">
                                                                {(teamInfo.id === 1 ? ['Thành viên', 'Phó bí thư', 'Bí thư'] : ['Thành viên', 'Phó ban', 'Trưởng ban']).map((position) => (
                                                                    <label key={`${teamInfo.id}-${position}`} className="position-checkbox-item">
                                                                        <input
                                                                            type="radio"
                                                                            name={`team-position-${teamInfo.id}`}
                                                                            checked={tForm.team_position === position}
                                                                            onChange={() => {
                                                                                setForm(p => {
                                                                                    const nextTeams = [...p.teams];
                                                                                    const idx = nextTeams.findIndex(t => t.team_id === teamInfo.id);
                                                                                    if (idx >= 0) nextTeams[idx].team_position = position;
                                                                                    return { ...p, teams: nextTeams };
                                                                                });
                                                                            }}
                                                                        />
                                                                        <span>{position}</span>
                                                                    </label>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </>
                                )}

                                {form.member_type === TABS.TEACHER && (
                                    <div className="form-group">
                                        <label className="form-label">Chức vụ *</label>
                                        <select
                                            className="form-control"
                                            value={form.teams[0]?.team_position || 'Thành viên'}
                                            onChange={e => {
                                                const pos = e.target.value;
                                                const tid = pos === 'Bí thư' ? 1 : null;
                                                setForm(p => ({ ...p, teams: [{ team_id: tid, team_position: pos }] }));
                                            }}
                                        >
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
                    </section>
                </div>
            )}

            {confirmModal}
        </div>
    );
}

