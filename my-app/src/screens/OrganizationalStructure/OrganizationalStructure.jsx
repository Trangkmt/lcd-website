import React from 'react';
import './OrganizationalStructure.css';

const OrganizationalStructure = () => {
    const departments = [
        {
            id: 1,
            name: 'Ban Văn Thể',
            description: 'Tổ chức các hoạt động văn hóa, văn nghệ, thể dục thể thao',
            icon: '🏃',
            level: 'top'
        },
        {
            id: 2,
            name: 'Ban Truyền Thông Kỹ Thuật',
            description: 'Quản lý fanpage, website, thiết kế poster, quay dựng video',
            icon: '📱',
            level: 'second-left'
        },
        {
            id: 3,
            name: 'Ban Tổ Chức Sự Kiện',
            description: 'Lên kế hoạch và tổ chức các sự kiện của Liên Chi Đoàn',
            icon: '🎯',
            level: 'second-right'
        },
        {
            id: 4,
            name: 'Ban Đối Ngoại',
            description: 'Kết nối với các tổ chức bên ngoài, tìm kiếm tài trợ',
            icon: '🤝',
            level: 'third-left'
        },
        {
            id: 5,
            name: 'Ban Công Tác Đoàn và Phát Triển Đảng',
            description: 'Quản lý đoàn viên, phát triển đảng viên, công tác đoàn',
            icon: '⭐',
            level: 'third-right'
        }
    ];

    return (
        <div className="organizational-structure">
            <div className="org-header">
                <h1 className="org-title">Cơ Cấu Tổ Chức</h1>
                <p className="org-subtitle">Liên Chi Đoàn Khoa Công Nghệ Thông Tin</p>
            </div>

            <div className="pyramid-container">
                {/* Leadership Level */}
                <div className="pyramid-level leadership-level">
                    <div className="leadership-card">
                        <div className="leadership-icon">👨‍💼</div>
                        <h2>Ban Chủ Nhiệm</h2>
                        <div className="leadership-roles">
                            <div className="role">
                                <span className="role-title">Bí thư</span>
                            </div>
                            <div className="role">
                                <span className="role-title">Phó Bí thư</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pyramid Structure */}
                <div className="pyramid-structure">
                    {/* Level 1 - Top */}
                    <div className="pyramid-level level-1">
                        {departments.filter(d => d.level === 'top').map(dept => (
                            <div key={dept.id} className="department-card">
                                <div className="dept-icon">{dept.icon}</div>
                                <h3 className="dept-name">{dept.name}</h3>
                                <p className="dept-description">{dept.description}</p>
                            </div>
                        ))}
                    </div>

                    {/* Level 2 - Second Row */}
                    <div className="pyramid-level level-2">
                        {departments.filter(d => d.level.startsWith('second')).map(dept => (
                            <div key={dept.id} className="department-card">
                                <div className="dept-icon">{dept.icon}</div>
                                <h3 className="dept-name">{dept.name}</h3>
                                <p className="dept-description">{dept.description}</p>
                            </div>
                        ))}
                    </div>

                    {/* Level 3 - Third Row */}
                    <div className="pyramid-level level-3">
                        {departments.filter(d => d.level.startsWith('third')).map(dept => (
                            <div key={dept.id} className="department-card">
                                <div className="dept-icon">{dept.icon}</div>
                                <h3 className="dept-name">{dept.name}</h3>
                                <p className="dept-description">{dept.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Connecting Lines */}
            <svg className="connecting-lines" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid meet">
                {/* Lines from Leadership to Top Level */}
                <line x1="500" y1="120" x2="500" y2="180" stroke="#667eea" strokeWidth="2" strokeDasharray="5,5" />

                {/* Lines from Level 1 to Level 2 */}
                <line x1="500" y1="280" x2="350" y2="350" stroke="#667eea" strokeWidth="2" strokeDasharray="5,5" />
                <line x1="500" y1="280" x2="650" y2="350" stroke="#667eea" strokeWidth="2" strokeDasharray="5,5" />

                {/* Lines from Level 2 to Level 3 */}
                <line x1="350" y1="450" x2="300" y2="520" stroke="#667eea" strokeWidth="2" strokeDasharray="5,5" />
                <line x1="650" y1="450" x2="700" y2="520" stroke="#667eea" strokeWidth="2" strokeDasharray="5,5" />
            </svg>

            {/* Statistics Section */}
            <div className="org-stats">
                <div className="stat-card">
                    <div className="stat-number">5</div>
                    <div className="stat-label">Ban Chức Năng</div>
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
