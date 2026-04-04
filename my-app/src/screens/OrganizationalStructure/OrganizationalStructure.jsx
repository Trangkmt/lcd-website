import React, { useState, useEffect } from 'react';
import './OrganizationalStructure.css';
import { organizationsAPI, usersAPI } from '../../services/api';

const BOARD_DEFINITIONS = [
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

const OrganizationalStructure = () => {
    const [boardNodes, setBoardNodes] = useState([]);
    const [secretary, setSecretary] = useState(null);
    const [viceSecretaries, setViceSecretaries] = useState([]);
    const [executiveHeads, setExecutiveHeads] = useState([]);
    const [totalMembers, setTotalMembers] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            organizationsAPI.getAll().catch(() => []),
            usersAPI.getAll().catch(() => []),
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
                    const relatedMembers = members.filter((member) => parseDepartments(member.department).includes(definition.key));
                    const head = relatedMembers.find((member) => hasPosition(member, 'trưởng ban')) || null;
                    const deputy = relatedMembers.find((member) => hasPosition(member, 'phó ban')) || null;

                    return {
                        id: org?.id || definition.key,
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
                    computedNodes.map((node) => node.head).filter(Boolean)
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

    return (
        <div className="organizational-structure">
            <div className="org-header">
                <h1 className="org-title">Cơ Cấu Tổ Chức</h1>
                <p className="org-subtitle">Liên Chi Đoàn Khoa Công Nghệ Thông Tin</p>
            </div>

            <div className="org-container">
                <div className="mindmap-center">
                    <div className="mindmap-center__icon">🧠</div>
                    <h2 className="mindmap-center__title">Ban Chấp Hành</h2>
                    <div className="mindmap-center__roles">
                        <div className="role-chip">
                            <span className="role-chip__label">Bí thư</span>
                            <strong>{secretary?.full_name || 'Chưa cập nhật'}</strong>
                        </div>
                        <div className="role-chip role-chip--stack">
                            <span className="role-chip__label">Phó bí thư</span>
                            <div className="role-chip__list">
                                {viceSecretaries.length > 0 ? (
                                    viceSecretaries.map((member) => (
                                        <span key={member.id} className="role-chip__person">{member.full_name}</span>
                                    ))
                                ) : (
                                    <span className="role-chip__person role-chip__person--muted">Chưa cập nhật</span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="mindmap-center__subtext">
                        Ủy viên BCH: {executiveHeads.length > 0 ? executiveHeads.map((member) => member.full_name).join(', ') : 'Chưa cập nhật'}
                    </div>
                </div>

                <div className="mindmap-connector" />

                <div className="mindmap-grid">
                    {boardNodes.map((board) => (
                        <div key={board.id} className="mindmap-node">
                            <div className="mindmap-node__head">
                                <span className="mindmap-node__icon">{board.icon}</span>
                                <h3 className="mindmap-node__title">{board.name}</h3>
                            </div>
                            <p className="mindmap-node__description">{board.description}</p>

                            <div className="mindmap-node__roles">
                                <div className="node-role-line">
                                    <span>Trưởng ban</span>
                                    <strong>{board.head?.full_name || 'Chưa cập nhật'}</strong>
                                </div>
                                <div className="node-role-line">
                                    <span>Phó ban</span>
                                    <strong>{board.deputy?.full_name || 'Chưa cập nhật'}</strong>
                                </div>
                            </div>

                            <div className="mindmap-node__members">
                                {board.members.length > 0 ? (
                                    board.members.map((member) => (
                                        <span key={member.id} className="member-tag">{member.full_name}</span>
                                    ))
                                ) : (
                                    <span className="member-tag member-tag--muted">Chưa có thành viên</span>
                                )}
                            </div>
                        </div>
                    ))}
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
                    <div className="stat-number">{executiveHeads.length + (secretary ? 1 : 0)}</div>
                    <div className="stat-label">Nhân sự BCH</div>
                </div>
            </div>
        </div>
    );
};

export default OrganizationalStructure;
