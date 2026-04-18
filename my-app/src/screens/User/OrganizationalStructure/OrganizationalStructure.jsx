import React, { useState, useEffect } from 'react';
import './OrganizationalStructure.css';
import { organizationsAPI, usersAPI } from '../../../services/api';

const BOARD_DEFINITIONS = [
    {
        key: 'ban chap hanh',
        label: 'BAN CHẤP HÀNH',
        icon: '🏛️',
        description: 'Điều phối hoạt động chung và quản lý các ban chuyên môn',
    },
    {
        key: 'ban van the',
        label: 'Ban Văn Thể',
        icon: '🏃',
        description: 'Tổ chức các hoạt động văn hóa, văn nghệ, thể dục thể thao',
    },
    {
        key: 'ban truyen thong ky thuat',
        label: 'Ban Truyền Thông Kỹ Thuật',
        icon: '📱',
        description: 'Quản lý fanpage, website, thiết kế poster, quay dựng video',
    },
    {
        key: 'ban to chuc su kien',
        label: 'Ban Tổ Chức Sự Kiện',
        icon: '🎯',
        description: 'Lên kế hoạch và tổ chức các sự kiện của Liên Chi Đoàn',
    },
    {
        key: 'ban doi ngoai',
        label: 'Ban Đối Ngoại',
        icon: '🤝',
        description: 'Kết nối với các tổ chức bên ngoài, tìm kiếm tài trợ',
    },
    {
        key: 'ban cong tac doan va phat trien dang',
        label: 'Ban Công Tác Đoàn và Phát Triển Đảng',
        icon: '⭐',
        description: 'Quản lý đoàn viên, phát triển đảng viên, công tác đoàn',
    },
];

const DEPARTMENT_ALIASES = {
    bch: 'ban chap hanh',
    'ban chap hanh': 'ban chap hanh',
    'ban chấp hành': 'ban chap hanh',

    'ban van the': 'ban van the',
    'ban văn thể': 'ban van the',

    ttkt: 'ban truyen thong ky thuat',
    'ban truyen thong ky thuat': 'ban truyen thong ky thuat',
    'ban truyền thông kỹ thuật': 'ban truyen thong ky thuat',

    tcsk: 'ban to chuc su kien',
    'ban to chuc su kien': 'ban to chuc su kien',
    'ban tổ chức sự kiện': 'ban to chuc su kien',

    dn: 'ban doi ngoai',
    'ban doi ngoai': 'ban doi ngoai',
    'ban đối ngoại': 'ban doi ngoai',

    'ctd & ptd': 'ban cong tac doan va phat trien dang',
    'ctd&ptd': 'ban cong tac doan va phat trien dang',
    ctd: 'ban cong tac doan va phat trien dang',
    ptd: 'ban cong tac doan va phat trien dang',
    'ban cong tac doan va phat trien dang': 'ban cong tac doan va phat trien dang',
    'ban công tác đoàn và phát triển đảng': 'ban cong tac doan va phat trien dang',
};

function normalizeText(value) {
    return String(value || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .trim();
}

function normalizeDepartmentKey(value) {
    const raw = normalizeText(value);
    return DEPARTMENT_ALIASES[raw] || raw;
}

function toArray(value) {
    if (Array.isArray(value)) return value;
    if (value === null || value === undefined) return [];
    return String(value)
        .split(/[,;|]/)
        .map((item) => item.trim())
        .filter(Boolean);
}

function parseDepartments(value) {
    return [...new Set(toArray(value).map(normalizeDepartmentKey).filter(Boolean))];
}

function hasPosition(member, target) {
    const targetNorm = normalizeText(target);
    return toArray(member?.department_position)
        .map(normalizeText)
        .some((position) => position === targetNorm);
}

function uniqueMembersById(members) {
    const map = new Map();
    members.forEach((member) => {
        if (member && member.id !== undefined && member.id !== null) {
            map.set(member.id, member);
        }
    });
    return Array.from(map.values());
}

function extractStudentId(member) {
    return String(
        member?.student_id
        || member?.student_code
        || member?.studentCode
        || member?.mssv
        || ''
    ).trim();
}

function extractComparableStudentNumber(studentId) {
    const digits = String(studentId || '').replace(/\D/g, '');
    if (!digits) return Number.POSITIVE_INFINITY;
    return Number.parseInt(digits, 10);
}

function extractBirthTimestamp(member) {
    const birthRaw = member?.date_of_birth || member?.birth_date || member?.birthday || null;
    const timestamp = birthRaw ? new Date(birthRaw).getTime() : Number.NaN;
    return Number.isNaN(timestamp) ? Number.POSITIVE_INFINITY : timestamp;
}

function compareMembersByCohortOrAge(a, b) {
    const idA = extractStudentId(a);
    const idB = extractStudentId(b);

    const idNumberA = extractComparableStudentNumber(idA);
    const idNumberB = extractComparableStudentNumber(idB);
    if (idNumberA !== idNumberB) return idNumberA - idNumberB;

    const birthA = extractBirthTimestamp(a);
    const birthB = extractBirthTimestamp(b);
    if (birthA !== birthB) return birthA - birthB;

    return String(a?.full_name || '').localeCompare(String(b?.full_name || ''), 'vi');
}

function extractMemberEmail(member) {
    return String(member?.email || member?.school_email || member?.contact_email || '').trim();
}

function extractMemberAvatar(member) {
    return String(
        member?.avatar
        || member?.avatar_url
        || member?.profile_image
        || member?.image_url
        || member?.photo_url
        || ''
    ).trim();
}

function getInitials(fullName) {
    const words = String(fullName || '').trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return '?';
    if (words.length === 1) return words[0].slice(0, 1).toUpperCase();
    return `${words[0].slice(0, 1)}${words[words.length - 1].slice(0, 1)}`.toUpperCase();
}

function getBchRole(member) {
    if (hasPosition(member, 'bí thư')) return 'Bí thư';
    if (hasPosition(member, 'phó bí thư')) return 'Phó bí thư';
    return 'Ban chấp hành';
}

const BCH_KEY = 'ban chap hanh';
const LEADER_ROLES = new Set(['Trưởng ban', 'Phó ban', 'Bí thư', 'Phó bí thư']);

const OrganizationalStructure = () => {
    const [boardNodes, setBoardNodes] = useState([]);
    const [selectedBoardKey, setSelectedBoardKey] = useState(null);
    const [secretary, setSecretary] = useState(null);
    const [viceSecretaries, setViceSecretaries] = useState([]);
    const [executiveHeads, setExecutiveHeads] = useState([]);
    const [totalMembers, setTotalMembers] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            organizationsAPI.getAll().catch(() => []),
            usersAPI.getPublic().catch(() => []),
        ])
            .then(([orgData, usersData]) => {
                const organizations = Array.isArray(orgData) ? orgData : [];
                const members = Array.isArray(usersData)
                    ? usersData.filter((member) => !!member?.is_active)
                    : [];

                const organizationByKey = new Map();
                organizations.forEach((org) => {
                    const key = normalizeDepartmentKey(org?.name);
                    if (key) organizationByKey.set(key, org);
                });

                const computedNodes = BOARD_DEFINITIONS.map((definition) => {
                    const org = organizationByKey.get(definition.key);
                    const relatedMembers = definition.key === BCH_KEY
                        ? members.filter((member) => {
                            const inBchDepartment = parseDepartments(member.department).includes(BCH_KEY);
                            const isSecretary = hasPosition(member, 'bí thư');
                            return inBchDepartment || isSecretary;
                        })
                        : members.filter((member) => parseDepartments(member.department).includes(definition.key));
                    const head = relatedMembers.find((member) => hasPosition(member, 'trưởng ban')) || null;
                    const deputy = relatedMembers.find((member) => hasPosition(member, 'phó ban')) || null;

                    return {
                        id: org?.id || definition.key,
                        key: definition.key,
                        name: org?.name || definition.label,
                        description: org?.description || definition.description,
                        icon: definition.icon,
                        head,
                        deputy,
                        members: relatedMembers,
                    };
                });

                const computedSecretary = members.find((member) => hasPosition(member, 'bí thư') && member.member_type === 'teacher')
                    || members.find((member) => hasPosition(member, 'bí thư'))
                    || null;

                const computedViceSecretaries = uniqueMembersById(
                    members.filter((member) => hasPosition(member, 'phó bí thư'))
                ).slice(0, 2);

                const computedHeads = uniqueMembersById(
                    members.filter((member) => parseDepartments(member.department).includes(BCH_KEY))
                );

                setBoardNodes(computedNodes);
                setSecretary(computedSecretary);
                setViceSecretaries(computedViceSecretaries);
                setExecutiveHeads(computedHeads);
                setTotalMembers(members.length);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="organizational-structure">
                <div className="org-header">
                    <h1 className="org-title">Cơ Cấu Tổ Chức</h1>
                    <p className="org-subtitle">Liên Chi Đoàn Khoa Công Nghệ Thông Tin</p>
                </div>
                <div className="org-loading">Đang tải...</div>
            </div>
        );
    }

    const viceSecretarySlots = [0, 1].map((index) => viceSecretaries[index] || null);
    const selectedBoard = boardNodes.find((board) => board.key === selectedBoardKey) || null;
    const selectedBoardMembers = selectedBoard
        ? (() => {
            if (selectedBoard.key === BCH_KEY) {
                return uniqueMembersById(selectedBoard.members)
                    .sort(compareMembersByCohortOrAge)
                    .sort((a, b) => {
                        const rolePriority = {
                            'Bí thư': 0,
                            'Phó bí thư': 1,
                            'Ban chấp hành': 2,
                        };
                        return rolePriority[getBchRole(a)] - rolePriority[getBchRole(b)];
                    })
                    .map((member) => ({
                        member,
                        role: getBchRole(member),
                    }));
            }

            const leaderIds = new Set(
                [selectedBoard.head?.id, selectedBoard.deputy?.id]
                    .filter((value) => value !== undefined && value !== null)
            );

            const otherMembers = uniqueMembersById(
                selectedBoard.members.filter((member) => !leaderIds.has(member?.id))
            ).sort(compareMembersByCohortOrAge);

            const rankedMembers = [];
            if (selectedBoard.head) {
                rankedMembers.push({ member: selectedBoard.head, role: 'Trưởng ban' });
            }
            if (selectedBoard.deputy && selectedBoard.deputy.id !== selectedBoard.head?.id) {
                rankedMembers.push({ member: selectedBoard.deputy, role: 'Phó ban' });
            }

            otherMembers.forEach((member) => {
                rankedMembers.push({ member, role: 'Thành viên' });
            });

            return rankedMembers;
        })()
        : [];

    const selectedBoardLeaders = selectedBoardMembers.filter(({ role }) => LEADER_ROLES.has(role));
    const selectedBoardRegularMembers = selectedBoardMembers.filter(({ role }) => !LEADER_ROLES.has(role));

    const renderMemberInfoCard = (member, role, key, extraClassName = '') => {
        const avatar = extractMemberAvatar(member);
        const email = extractMemberEmail(member);
        const cardClassName = `org-member-card ${extraClassName}`.trim();

        return (
            <article key={key} className={cardClassName}>
                <div className="org-member-card__avatar-wrap">
                    {avatar ? (
                        <img
                            src={avatar}
                            alt={member?.full_name || 'Thành viên'}
                            className="org-member-card__avatar"
                        />
                    ) : (
                        <div className="org-member-card__avatar-placeholder" aria-hidden="true">
                            {getInitials(member?.full_name)}
                        </div>
                    )}
                </div>
                <strong className="org-member-card__name">{member?.full_name || 'Chưa cập nhật'}</strong>
                <span className="org-member-card__position">{role}</span>
                {email ? (
                    <a className="org-member-card__email" href={`mailto:${email}`}>{email}</a>
                ) : (
                    <span className="org-member-card__email org-member-card__email--muted">Chưa cập nhật email</span>
                )}
            </article>
        );
    };

    return (
        <div className="organizational-structure">
            <div className="org-header">
                <h1 className="org-title">Cơ Cấu Tổ Chức</h1>
                <p className="org-subtitle">Liên Chi Đoàn Khoa Công Nghệ Thông Tin</p>
            </div>

            <div className="org-container">
                <div className="org-chart">
                    <div className="org-chart__level org-chart__level--top">
                        {renderMemberInfoCard(secretary, 'Bí thư', `secretary-${secretary?.id || 'empty'}`, 'org-member-card--hierarchy')}
                    </div>

                    <div className="org-chart__line org-chart__line--top" />

                    <div className="org-chart__level org-chart__level--middle">
                        {viceSecretarySlots.map((member, index) => (
                            renderMemberInfoCard(member, 'Phó bí thư', `vice-${member?.id || index}`, 'org-member-card--hierarchy')
                        ))}
                    </div>

                    <div className="org-chart__line org-chart__line--trunk" />

                    <div className="org-chart__level org-chart__level--bottom">
                        {boardNodes.map((board) => (
                            <button
                                key={board.id}
                                type="button"
                                className={`org-chart-card org-chart-card--board ${selectedBoardKey === board.key ? 'org-chart-card--board-active' : ''}`}
                                onClick={() => setSelectedBoardKey((prev) => (prev === board.key ? null : board.key))}
                                aria-expanded={selectedBoardKey === board.key}
                                aria-label={`Xem danh sách thành viên của ${board.name}`}
                            >
                                <h3 className="org-chart-card__board-name">{board.name}</h3>
                            </button>
                        ))}
                    </div>
                </div>

                {selectedBoard && (
                    <div className="org-members-panel">
                        <h3 className="org-members-panel__title">{selectedBoard.name}</h3>
                        {selectedBoardMembers.length > 0 ? (
                            <>
                                {selectedBoardLeaders.length > 0 && (
                                    <div className="org-members-list org-members-list--leaders">
                                        {selectedBoardLeaders.map(({ member, role }, index) => {
                                            return renderMemberInfoCard(member, role, member?.id || `${role}-${index}`, 'org-member-card--leader');
                                        })}
                                    </div>
                                )}

                                {selectedBoardRegularMembers.length > 0 && (
                                    <div className="org-members-list org-members-list--members">
                                        {selectedBoardRegularMembers.map(({ member, role }, index) => {
                                            return renderMemberInfoCard(member, role, member?.id || `${role}-${index}`);
                                        })}
                                    </div>
                                )}
                            </>
                        ) : (
                            <p className="org-members-empty">Chưa có thành viên</p>
                        )}
                    </div>
                )}

                <div className="org-note">
                    Ban chấp hành: {executiveHeads.length > 0 ? executiveHeads.map((member) => member.full_name).join(', ') : 'Chưa cập nhật'}
                </div>
            </div>

            <div className="org-stats">
                <div className="stat-card">
                    <div className="stat-number">{boardNodes.length}</div>
                    <div className="stat-label">Ban chuyên môn</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{totalMembers}</div>
                    <div className="stat-label">Thành Viên</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{executiveHeads.length}</div>
                    <div className="stat-label">Nhân sự BCH</div>
                </div>
            </div>
        </div>
    );
};

export default OrganizationalStructure;
