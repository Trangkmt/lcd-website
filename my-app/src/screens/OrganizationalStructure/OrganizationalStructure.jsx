import React, { useState, useEffect } from 'react';
import './OrganizationalStructure.css';
import { organizationsAPI } from '../../services/api';

const ICONS = ['🏃', '📱', '🎯', '🤝', '⭐', '📚', '🔍', '💻', '🚀', '🌐'];

const fallbackDepartments = [
    { id: 1, name: 'Ban Văn Thể', description: 'Tổ chức các hoạt động văn hóa, văn nghệ, thể dục thể thao' },
    { id: 2, name: 'Ban Truyền Thông Kỹ Thuật', description: 'Quản lý fanpage, website, thiết kế poster, quay dựng video' },
    { id: 3, name: 'Ban Tổ Chức Sự Kiện', description: 'Lên kế hoạch và tổ chức các sự kiện của Liên Chi Đoàn' },
    { id: 4, name: 'Ban Đối Ngoại', description: 'Kết nối với các tổ chức bên ngoài, tìm kiếm tài trợ' },
    { id: 5, name: 'Ban Công Tác Đoàn và Phát Triển Đảng', description: 'Quản lý đoàn viên, phát triển đảng viên, công tác đoàn' },
];

const OrganizationalStructure = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        organizationsAPI.getAll()
            .then(data => {
                const orgs = Array.isArray(data) && data.length > 0 ? data : fallbackDepartments;
                setDepartments(orgs.map((org, idx) => ({
                    id: org.id,
                    name: org.name,
                    description: org.description || '',
                    icon: ICONS[idx % ICONS.length],
                })));
            })
            .catch(() => {
                setDepartments(fallbackDepartments.map((org, idx) => ({
                    ...org, icon: ICONS[idx % ICONS.length]
                })));
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
                <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.8)' }}>Đang tải...</div>
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
                {/* Leadership */}
                <div className="leadership-level">
                    <div className="leadership-card">
                        <div className="leadership-icon">👨‍💼</div>
                        <h2>Ban Chủ Nhiệm</h2>
                        <div className="leadership-roles">
                            <div className="role"><span className="role-title">Bí thư</span></div>
                            <div className="role"><span className="role-title">Phó Bí thư</span></div>
                        </div>
                    </div>
                </div>

                {/* All Departments Grid */}
                <div className="departments-grid">
                    {departments.map(dept => (
                        <div key={dept.id} className="department-card">
                            <div className="dept-icon">{dept.icon}</div>
                            <h3 className="dept-name">{dept.name}</h3>
                            <p className="dept-description">{dept.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Statistics Section */}
            <div className="org-stats">
                <div className="stat-card">
                    <div className="stat-number">{departments.length}</div>
                    <div className="stat-label">Ban / CLB</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">50+</div>
                    <div className="stat-label">Thành Viên</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">100+</div>
                    <div className="stat-label">Hoạt Động/Năm</div>
                </div>
            </div>
        </div>
    );
};

export default OrganizationalStructure;
