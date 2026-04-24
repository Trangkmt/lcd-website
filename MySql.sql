-- ================================================
-- TẠO DATABASE
-- ================================================
CREATE DATABASE IF NOT EXISTS MyAppDB
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE MyAppDB;

-- ================================================
-- XÓA BẢNG CŨ
-- ================================================
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS contact_info;
DROP TABLE IF EXISTS organizations;
DROP TABLE IF EXISTS timeline_events;
DROP TABLE IF EXISTS activities;
DROP TABLE IF EXISTS documents;
DROP TABLE IF EXISTS news;
DROP TABLE IF EXISTS post_templates;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- ================================================
-- USERS
-- ================================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    full_name VARCHAR(100),
    avatar_url VARCHAR(500),
    role ENUM('admin_full', 'utility_only', 'contact_manager', 'post_author') NOT NULL DEFAULT 'post_author',
    member_type ENUM('student', 'teacher') NOT NULL DEFAULT 'student',
    student_code VARCHAR(30),
    class_name VARCHAR(50),
    department VARCHAR(100),
    department_position TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO users (
    username,password,email,full_name,avatar_url,role,
    member_type,student_code,class_name,department,department_position,is_active
) VALUES
('admin','123456','admin@myapp.com','Nguyễn Văn Admin',NULL,'admin_full','teacher',NULL,NULL,'ban chấp hành','admin hệ thống',TRUE),
('bi-thu-fit','123456','bithu.fit@neu.edu.vn','TS. Nguyễn Văn A',NULL,'utility_only','teacher',NULL,NULL,'ban chấp hành','bí thư',TRUE);

-- ================================================
-- CATEGORIES
-- ================================================
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    intro_image VARCHAR(500),
    parent_id INT,
    page_type VARCHAR(50) DEFAULT 'news',
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id)
);

INSERT INTO categories (id,name,slug,page_type,description,intro_image,parent_id) VALUES
(1,'Tin tức','tin-tuc','news','Tin tức của Liên Chi đoàn',NULL,NULL),
(2,'Thông báo','thong-bao','news','Thông báo chính thức',NULL,NULL),
(3,'Sự kiện','su-kien','news','Các sự kiện',NULL,NULL),
(4,'Hoạt động học thuật','hoc-thuat','activity','Hoạt động học thuật',NULL,NULL),
(5,'Hoạt động tình nguyện','tinh-nguyen','activity','Hoạt động cộng đồng',NULL,NULL),
(6,'Hoạt động thể thao','the-thao','activity','Hoạt động thể thao',NULL,NULL),
(7,'Thành tích','thanh-tich','achievement','Thành tích nổi bật',NULL,NULL),
(8,'Tài liệu','tai-lieu','document','Tài liệu',NULL,NULL),
(9,'Chương trình thường niên','thuong-nien','activity_annual','Hoạt động thường niên',NULL,NULL),
(10,'Khác','khac','news','Danh mục khác',NULL,NULL),
(11,'Chào tân sinh viên','chao-tan-sinh-vien','activity_annual','Lễ chào tân sinh viên khóa mới',NULL,9),
(12,'Quân sự','quan-su','activity_annual','Quân sự huấn luyện sinh viên',NULL,9),
(13,'FIT Cup','fit-cup','activity_annual','Giải bóng đá FIT Cup',NULL,9),
(14,'Prom','prom','activity_annual','Lễ prom sinh viên',NULL,9),
(15,'Talkshow','talkshow','activity_annual','Talkshow và giao lưu',NULL,9),
(16,'Cuộc thi','cuoc-thi','activity_annual','Các cuộc thi và hackathon',NULL,9);

-- ================================================
-- POST TEMPLATES
-- ================================================
CREATE TABLE post_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category_id INT,
    title_template VARCHAR(255),
    summary_template TEXT,
    content_template LONGTEXT,
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

INSERT INTO post_templates (name, category_id, title_template, summary_template, content_template, is_default, created_by) VALUES
(
    'Template Chào tân sinh viên',
    11,
    'Chào tân K67 đã bắt đầu',
    'Chương trình Chào tân sinh viên K67 chính thức khởi động với nhiều hoạt động kết nối và truyền cảm hứng.',
    '<h2>Chào tân K67 đã bắt đầu</h2><p>Chương trình Chào tân K67 đã bắt đầu với không khí sôi động, nhiều hoạt động giao lưu giữa tân sinh viên và các anh chị khóa trên.</p><p>Trong buổi mở màn, Ban tổ chức đã giới thiệu tổng quan về Liên Chi đoàn, định hướng học tập và các câu lạc bộ để các bạn nhanh chóng hòa nhập môi trường đại học.</p><p>Hãy theo dõi fanpage để cập nhật lịch trình chi tiết và các mốc đăng ký hoạt động tiếp theo.</p>',
    TRUE,
    1
),
(
    'Template FIT Cup',
    13,
    'FIT Cup {{year}} chính thức khởi tranh',
    'Giải bóng đá thường niên FIT Cup đã quay trở lại với nhiều đội thi và hoạt động đồng hành hấp dẫn.',
    '<h2>FIT Cup {{year}} chính thức khởi tranh</h2><p>FIT Cup năm nay quy tụ nhiều đội bóng sinh viên và hứa hẹn mang lại những trận đấu bùng nổ.</p><p>Ban tổ chức khuyến khích các bạn sinh viên tham gia cổ vũ văn minh, lan tỏa tinh thần thể thao đoàn kết của khoa CNTT.</p>',
    TRUE,
    1
);

-- ================================================
-- NEWS
-- ================================================
CREATE TABLE news (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    summary TEXT,
    content LONGTEXT,
    thumbnail VARCHAR(255),
    category_id INT,
    author_id INT,
    view_count INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT FALSE,
    published_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (author_id) REFERENCES users(id)
);


-- ================================================
-- DOCUMENTS
-- ================================================
CREATE TABLE documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    file_type VARCHAR(50),
    category_id INT,
    uploaded_by INT,
    download_count INT DEFAULT 0,
    is_public BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- ================================================
-- ACTIVITIES
-- ================================================
CREATE TABLE activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    content LONGTEXT,
    location VARCHAR(255),
    start_date DATETIME,
    end_date DATETIME,
    thumbnail VARCHAR(255),
    images TEXT,
    organizer VARCHAR(255),
    category_id INT,
    created_by INT,
    view_count INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

INSERT INTO activities (title,slug,description,location,start_date,end_date,category_id,created_by) VALUES
('Lễ chào tân sinh viên','chao-tan','Chương trình chào tân sinh viên khóa 25 được tổ chức nhằm giúp các bạn sinh viên mới làm quen với môi trường đại học.','Hội trường chính','2025-09-01','2025-09-02',11,1),
('Quân sự','quan-su','Chương trình quân sự huấn luyện sinh viên khóa mới, giúp các bạn nâng cao tinh thần kỷ luật và thể lực.','Sân trường','2025-09-05','2025-09-10',12,1),
('FIT Cup','fit-cup','Giải bóng đá FIT Cup thường niên, đây là sân chơi lớn nhất của sinh viên khoa CNTT mỗi năm.','Sân bóng đá UTE','2025-10-01','2025-10-20',13,1),
('Prom sinh viên','prom-2025','Lễ prom sinh viên khoa CNTT - sự kiện lớn nhất của năm học với sự tham gia của hàng trăm bạn sinh viên.','Sân khấu trước hội trường','2025-12-15','2025-12-15',14,1),
('Talkshow công nghệ','talkshow-tech','Talkshow về xu hướng công nghệ mới, các chuyên gia chia sẻ kinh nghiệm và cơ hội nghề nghiệp.','Phòng hội thảo','2025-05-20','2025-05-20',15,1);

-- ================================================
-- TIMELINE EVENTS
-- ================================================
CREATE TABLE timeline_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_type ENUM('annual') NOT NULL DEFAULT 'annual',
    month TINYINT NOT NULL,
    year SMALLINT NOT NULL,
    event_name VARCHAR(255) NOT NULL,
    summary TEXT,
    sort_order INT DEFAULT 0,
    is_published BOOLEAN DEFAULT TRUE,
    created_by INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_timeline_month CHECK (month BETWEEN 1 AND 12),
    CONSTRAINT chk_timeline_year CHECK (year BETWEEN 2000 AND 2100),
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ================================================
-- ORGANIZATIONS
-- ================================================
CREATE TABLE organizations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_abbr VARCHAR(50),
    description TEXT,
    logo VARCHAR(255),
    website VARCHAR(255),
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    parent_id INT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES organizations(id)
);

INSERT INTO organizations (name,name_abbr,description,display_order) VALUES
('Ban Chấp Hành','BCH','Gồm bí thư, phó bí thư và các ủy viên là trưởng ban, phó ban',0),
('Ban Văn Thể','BVT','Tổ chức các hoạt động văn hóa, văn nghệ, thể dục thể thao',1),
('Ban Truyền Thông Kỹ Thuật','TTKT','Quản lý fanpage, website, thiết kế poster, quay dựng video',2),
('Ban Tổ Chức Sự Kiện','TCSK','Lên kế hoạch và tổ chức các sự kiện của Liên Chi Đoàn',3),
('Ban Đối Ngoại','ĐN','Kết nối với các tổ chức bên ngoài, tìm kiếm tài trợ',4),
('Ban Công Tác Đoàn và Phát Triển Đảng','CTD & PTD','Quản lý đoàn viên, phát triển đảng viên, công tác đoàn',5);

-- ================================================
-- CONTACT INFO
-- ================================================
CREATE TABLE contact_info (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    subject VARCHAR(255),
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    is_replied BOOLEAN DEFAULT FALSE,
    replied_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO contact_info (name,email,phone,subject,message) VALUES
('Nguyễn Văn A','a@gmail.com','0900000001','Hỏi thông tin','Tôi muốn hỏi về hoạt động.'),
('Trần Văn B','b@gmail.com','0900000002','Đăng ký','Tôi muốn đăng ký sự kiện.'),
('Lê Văn C','c@gmail.com','0900000003','Tài liệu','Xin tài liệu học.'),
('Phạm Văn D','d@gmail.com','0900000004','CLB','Hỏi về CLB.'),
('Hoàng Văn E','e@gmail.com','0900000005','Sự kiện','Thông tin sự kiện.'),
('Nguyễn Văn F','f@gmail.com','0900000006','Workshop','Hỏi workshop.'),
('Trần Văn G','g@gmail.com','0900000007','Tuyển thành viên','CLB tuyển người?'),
('Lê Văn H','h@gmail.com','0900000008','Talkshow','Tham gia talkshow.'),
('Phạm Văn I','i@gmail.com','0900000009','Hackathon','Chi tiết hackathon'),
('Hoàng Văn K','k@gmail.com','0900000010','Khác','Liên hệ khác');

-- ================================================
-- INDEXES
-- ================================================
CREATE INDEX idx_news_category ON news(category_id);
CREATE INDEX idx_news_author ON news(author_id);
CREATE INDEX idx_news_published ON news(is_published, published_at);
CREATE INDEX idx_news_slug ON news(slug);
CREATE INDEX idx_documents_category ON documents(category_id);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX idx_activities_category ON activities(category_id);
CREATE INDEX idx_activities_created_by ON activities(created_by);
CREATE INDEX idx_activities_dates ON activities(start_date, end_date);
CREATE INDEX idx_timeline_year_month_published ON timeline_events(year, month, is_published);
CREATE INDEX idx_timeline_year_sort ON timeline_events(year, sort_order, month);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_page_type ON categories(page_type);
CREATE INDEX idx_organizations_parent ON organizations(parent_id);
CREATE INDEX idx_contact_read ON contact_info(is_read);
CREATE INDEX idx_contact_replied ON contact_info(is_replied);

USE MyAppDB;
SHOW TABLES;
SELECT COUNT(*) FROM news;
SELECT COUNT(*) FROM categories;

INSERT INTO news (title, slug, summary, content, thumbnail, category_id, author_id, is_published, published_at) VALUES (
'CHÍNH THỨC RA MẮT SỰ KIỆN CHÀO TÂN K67 - AETERNIA',
'chao-tan-k67-aeternia',
'Ra mắt chuỗi sự kiện chào tân sinh viên K67',
'“Ngai vàng có thể chỉ thuộc về một gia tộc, nhưng vinh quang thuộc về tất cả những ai đã dũng cảm bước vào cuộc chiến này.” Chuỗi sự kiện chào tân K67 của Khoa Công nghệ thông tin đã chính thức khởi động với chủ đề Aeternia - hành trình trở về vương quốc huy hoàng, nơi những tân sinh viên K67 sẽ đấu tranh và khẳng định bản lĩnh của mình. Từ những bước chân đầu tiên cho đến khi ánh sáng đêm gala bùng cháy, tất cả sẽ trở thành thử thách về tinh thần, ý chí và tài năng. Hãy theo dõi và đồng hành cùng LCĐ để chứng kiến hành trình chinh phục đầy cảm hứng này.',
'https://scontent.fhan1-1.fna.fbcdn.net/v/t39.30808-6/555062645_122182622720363677_7711415447417702913_n.jpg',
11,
1,
TRUE,
NOW()
);

INSERT INTO news (title, slug, summary, content, thumbnail, category_id, author_id, is_published, published_at) VALUES (
'RECAP TEAM BUILDING CHÀO TÂN SINH VIÊN K67',
'recap-team-building-k67',
'Tổng kết hoạt động team building chào tân K67',
'Vào Chủ nhật ngày 12/10, sự kiện team building chào đón tân sinh viên K67 của Khoa Công Nghệ Thông Tin đã diễn ra trong không khí sôi nổi, hào hứng và đầy cảm xúc. Với sự góp mặt đông đảo của các bạn sinh viên K67 cùng sự chuẩn bị chu đáo từ ban tổ chức AETERNIA, chương trình đã trở thành cầu nối giúp các bạn xóa tan sự bỡ ngỡ ban đầu, tạo nên những khoảnh khắc gắn kết và khơi dậy tinh thần nhiệt huyết. Những trò chơi đồng đội và thử thách sáng tạo đã giúp sinh viên thể hiện cá tính và tinh thần đoàn kết. K67 – hãy tiếp tục lan tỏa tinh thần Dám nghĩ – Dám làm – Dám bứt phá!',
'https://scontent.fhan1-1.fna.fbcdn.net/v/t39.30808-6/561656044_122184900914363677_5354723265214253294_n.jpg',
11,
1,
TRUE,
NOW()
);

INSERT INTO news (title, slug, summary, content, thumbnail, category_id, author_id, is_published, published_at) VALUES (
'THÔNG BÁO LỊCH THI ĐẤU TỨ KẾT – FIT CUP S2',
'fit-cup-tu-ket-s2',
'Lịch thi đấu vòng tứ kết FIT CUP',
'Sau những vòng đấu đầy kịch tính, FIT CUP S2 đã chính thức bước vào giai đoạn Tứ kết – nơi chỉ còn lại những đội bóng xuất sắc nhất tranh tài cho tấm vé đi tiếp. Ban tổ chức công bố lịch thi đấu với những cặp đấu hấp dẫn và khó đoán. Đây là những trận đấu mang tính quyết định, nơi bản lĩnh và chiến thuật được đẩy lên cao nhất. Hãy theo dõi và cổ vũ cho đội bóng bạn yêu thích!',
'https://scontent.fhan1-1.fna.fbcdn.net/v/t39.30808-6/672631244_122204880152363677_895006564231560541_n.jpg',
13,
1,
TRUE,
NOW()
);

INSERT INTO news (title, slug, summary, content, thumbnail, category_id, author_id, is_published, published_at) VALUES (
'FIT RACE – BỨT PHÁ GIỚI HẠN, LAN TỎA TINH THẦN THỂ THAO',
'fit-race-2026',
'Giải chạy FIT RACE 2026',
'FIT RACE không chỉ là một giải chạy mà còn là hành trình vượt qua giới hạn bản thân. Trên mỗi cung đường, từng bước chân là sự kiên trì, nỗ lực và quyết tâm không bỏ cuộc. Mỗi chặng đường mang đến cảm xúc riêng và lan tỏa năng lượng tích cực của tuổi trẻ. FIT RACE – nơi mỗi bước chạy là một lần bứt phá.',
'https://scontent.fhan1-1.fna.fbcdn.net/v/t39.30808-6/672631244_122204880152363677_895006564231560541_n.jpg',
6,
1,
TRUE,
NOW()
);

INSERT INTO news (title, slug, summary, content, thumbnail, category_id, author_id, is_published, published_at) VALUES (
'CHÀO MỪNG 95 NĂM NGÀY THÀNH LẬP ĐOÀN TNCS HỒ CHÍ MINH',
'chao-mung-95-nam-doan',
'Kỷ niệm 95 năm thành lập Đoàn TNCS Hồ Chí Minh',
'Tuổi trẻ Khoa Công nghệ thông tin xin gửi lời chúc mừng tới tổ chức Đoàn TNCS Hồ Chí Minh nhân dịp kỷ niệm 95 năm thành lập. Đây là hành trình của lý tưởng, cống hiến và khát vọng tuổi trẻ Việt Nam. Chúc các cán bộ Đoàn và đoàn viên luôn giữ vững nhiệt huyết, sáng tạo và sẵn sàng cống hiến.',
'https://scontent.fhan1-1.fna.fbcdn.net/v/t39.30808-6/658149560_122202375770363677_2379326581682089881_n.jpg',
2,
1,
TRUE,
NOW()
);

INSERT INTO news (title, slug, summary, content, thumbnail, category_id, author_id, is_published, published_at) VALUES (
'TUYÊN DƯƠNG TRẦN MINH KHÁNH – CÁN BỘ ĐOÀN TIÊU BIỂU 2026',
'tuyen-duong-tran-minh-khanh-2026',
'Tuyên dương cán bộ đoàn tiêu biểu năm 2026',
'Đồng chí Trần Minh Khánh – Phó Bí thư Liên chi Đoàn Khoa Công nghệ thông tin đã được tuyên dương là cán bộ Đoàn tiêu biểu năm 2026. Đây là sự ghi nhận xứng đáng cho những nỗ lực trong học tập và công tác Đoàn. Chúc đồng chí tiếp tục phát huy năng lực và đóng góp cho phong trào sinh viên.',
'https://scontent.fhan1-1.fna.fbcdn.net/v/t39.30808-6/657727925_122202465020363677_6172855170766289206_n.jpg',
7,
1,
TRUE,
NOW()
);