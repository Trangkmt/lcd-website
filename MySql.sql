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
DROP TABLE IF EXISTS activities;
DROP TABLE IF EXISTS documents;
DROP TABLE IF EXISTS news;
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
    role VARCHAR(20) DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (username,password,email,full_name,role) VALUES
('admin','123456','admin@myapp.com','Nguyễn Văn Admin','admin'),
('editor1','123456','editor1@myapp.com','Trần Minh Quang','editor'),
('editor2','123456','editor2@myapp.com','Phạm Thu Trang','editor'),
('user1','123456','user1@myapp.com','Lê Văn Hùng','user'),
('user2','123456','user2@myapp.com','Đỗ Thị Lan','user'),
('user3','123456','user3@myapp.com','Nguyễn Thành Nam','user'),
('user4','123456','user4@myapp.com','Bùi Khánh Linh','user'),
('user5','123456','user5@myapp.com','Hoàng Minh Đức','user'),
('user6','123456','user6@myapp.com','Phan Thị Hương','user'),
('user7','123456','user7@myapp.com','Vũ Quang Huy','user');

-- ================================================
-- CATEGORIES
-- ================================================
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    parent_id INT,
    page_type VARCHAR(50) DEFAULT 'news',
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id)
);

INSERT INTO categories (name,slug,page_type,description) VALUES
('Tin tức','tin-tuc','news','Tin tức của Liên Chi đoàn'),
('Thông báo','thong-bao','news','Thông báo chính thức'),
('Sự kiện','su-kien','news','Các sự kiện'),
('Hoạt động học thuật','hoc-thuat','activity','Hoạt động học thuật'),
('Hoạt động tình nguyện','tinh-nguyen','activity','Hoạt động cộng đồng'),
('Hoạt động thể thao','the-thao','activity','Hoạt động thể thao'),
('Thành tích','thanh-tich','achievement','Thành tích nổi bật'),
('Tài liệu','tai-lieu','document','Tài liệu'),
('Chương trình thường niên','thuong-nien','activity','Hoạt động thường niên'),
('Khác','khac','news','Danh mục khác');

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
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (author_id) REFERENCES users(id)
);

INSERT INTO news (title,slug,summary,content,category_id,author_id,is_published,published_at) VALUES
('Chào tân sinh viên K65','chao-tan-sinh-vien-k65',
'Chương trình chào tân sinh viên khoa CNTT',
'Chương trình chào tân sinh viên K65 được tổ chức nhằm giúp các bạn sinh viên mới làm quen với môi trường đại học, tìm hiểu về cơ cấu tổ chức Liên Chi đoàn và các câu lạc bộ trong khoa. Trong chương trình, sinh viên được giao lưu với các anh chị khóa trên, nghe chia sẻ kinh nghiệm học tập và tham gia nhiều hoạt động thú vị.',
1,1,1,NOW()),

('Talkshow Công nghệ AI','talkshow-ai',
'Talkshow về trí tuệ nhân tạo',
'Talkshow công nghệ AI mang đến nhiều thông tin hữu ích về xu hướng trí tuệ nhân tạo hiện nay. Các chuyên gia đã chia sẻ về ứng dụng AI trong doanh nghiệp, nghiên cứu khoa học và đời sống. Sinh viên có cơ hội đặt câu hỏi và tìm hiểu thêm về cơ hội nghề nghiệp trong lĩnh vực AI.',
3,2,1,NOW()),

('Cuộc thi lập trình sinh viên','cuoc-thi-lap-trinh',
'Cuộc thi lập trình thường niên',
'Cuộc thi lập trình sinh viên là sân chơi dành cho những bạn đam mê công nghệ. Thông qua cuộc thi, sinh viên được rèn luyện kỹ năng lập trình, tư duy thuật toán và làm việc nhóm.',
3,2,1,NOW()),

('Hoạt động hiến máu tình nguyện','hien-mau',
'Hoạt động hiến máu nhân đạo',
'Chương trình hiến máu tình nguyện được tổ chức với sự tham gia của hàng trăm sinh viên. Đây là hoạt động ý nghĩa góp phần giúp đỡ các bệnh nhân cần truyền máu.',
1,3,1,NOW()),

('Hội thảo chuyển đổi số','hoi-thao-chuyen-doi-so',
'Thảo luận về chuyển đổi số',
'Hội thảo chuyển đổi số mang đến nhiều góc nhìn về việc áp dụng công nghệ vào doanh nghiệp và tổ chức.',
1,2,1,NOW()),

('Ngày hội việc làm IT','ngay-hoi-viec-lam',
'Kết nối sinh viên với doanh nghiệp',
'Ngày hội việc làm IT là cơ hội để sinh viên gặp gỡ doanh nghiệp và tìm kiếm cơ hội thực tập.',
1,1,1,NOW()),

('Chương trình tình nguyện mùa hè','tinh-nguyen-mua-he',
'Hoạt động tình nguyện',
'Chương trình tình nguyện mùa hè xanh mang lại nhiều hoạt động ý nghĩa cho cộng đồng.',
1,2,1,NOW()),

('Workshop phát triển web','workshop-web',
'Workshop lập trình web',
'Workshop giúp sinh viên tìm hiểu React, NodeJS và các công nghệ web hiện đại.',
1,3,1,NOW()),

('Hội thao sinh viên','hoi-thao',
'Giải thể thao sinh viên',
'Giải thể thao sinh viên gồm nhiều môn thi đấu như bóng đá, cầu lông và bóng bàn.',
1,1,1,NOW()),

('Tổng kết năm học','tong-ket-nam-hoc',
'Tổng kết hoạt động',
'Lễ tổng kết nhằm đánh giá các hoạt động của Liên Chi đoàn trong năm học.',
1,1,1,NOW());

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
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

INSERT INTO documents (title,file_name,file_path,file_type,category_id,uploaded_by) VALUES
('Quy chế hoạt động','quyche.pdf','/docs/quyche.pdf','pdf',8,1),
('Hướng dẫn sinh viên','huongdan.pdf','/docs/huongdan.pdf','pdf',8,1),
('Tài liệu React','react.pdf','/docs/react.pdf','pdf',8,2),
('Tài liệu NodeJS','nodejs.pdf','/docs/nodejs.pdf','pdf',8,2),
('Slide AI','ai.ppt','/docs/ai.ppt','ppt',8,2),
('Slide Data','data.ppt','/docs/data.ppt','ppt',8,2),
('Tài liệu SQL','sql.pdf','/docs/sql.pdf','pdf',8,3),
('Hướng dẫn Git','git.pdf','/docs/git.pdf','pdf',8,3),
('Tài liệu DevOps','devops.pdf','/docs/devops.pdf','pdf',8,3),
('Tài liệu Docker','docker.pdf','/docs/docker.pdf','pdf',8,3);

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
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

INSERT INTO activities (title,slug,description,location,start_date,end_date,category_id,created_by) VALUES
('Chào tân sinh viên','chao-tan','Chào tân sinh viên','Hội trường A','2025-09-01','2025-09-01',9,1),
('Workshop AI','workshop-ai','Workshop AI','Phòng 301','2025-05-10','2025-05-10',4,2),
('Giải bóng đá','giai-bong-da','Giải bóng đá','Sân vận động','2025-06-01','2025-06-10',6,2),
('Tình nguyện mùa hè','tinh-nguyen-he','Hoạt động tình nguyện','Hòa Bình','2025-07-01','2025-07-10',5,3),
('Talkshow IT','talkshow-it','Talkshow','Phòng hội thảo','2025-05-20','2025-05-20',4,2),
('Hackathon','hackathon','Cuộc thi hackathon','Lab CNTT','2025-08-01','2025-08-02',4,1),
('Workshop Cloud','workshop-cloud','Cloud','Lab','2025-06-15','2025-06-15',4,1),
('Career Day','career-day','Ngày hội việc làm','Hall','2025-04-01','2025-04-01',4,1),
('Charity','charity','Thiện nguyện','Hà Giang','2025-07-20','2025-07-25',5,3),
('Sport Day','sport-day','Hội thao','Sân trường','2025-03-01','2025-03-01',6,1);

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
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES organizations(id)
);

INSERT INTO organizations (name,name_abbr,description) VALUES
('Liên Chi đoàn CNTT','LCD-CNTT','Tổ chức đoàn khoa CNTT'),
('Ban học tập','BHT','Ban học tập'),
('Ban truyền thông','BTT','Ban truyền thông'),
('Ban sự kiện','BSE','Ban sự kiện'),
('Ban đối ngoại','BDN','Ban đối ngoại'),
('Ban phong trào','BPT','Ban phong trào'),
('CLB Lập trình','CLB Code','Câu lạc bộ lập trình'),
('CLB AI','CLB AI','Câu lạc bộ AI'),
('CLB Game','CLB Game','Câu lạc bộ game'),
('CLB Data','CLB Data','Câu lạc bộ data');

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
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
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

-- ================================================ -- INDEXES -- ================================================ 
CREATE INDEX idx_news_category ON news(category_id); 
CREATE INDEX idx_news_author ON news(author_id); 
CREATE INDEX idx_news_published ON news(is_published, published_at); 
CREATE INDEX idx_news_slug ON news(slug); 
CREATE INDEX idx_documents_category ON documents(category_id); 
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by); 
CREATE INDEX idx_activities_category ON activities(category_id); 
CREATE INDEX idx_activities_created_by ON activities(created_by); 
CREATE INDEX idx_activities_dates ON activities(start_date, end_date); 
CREATE INDEX idx_categories_slug ON categories(slug); 
CREATE INDEX idx_categories_parent ON categories(parent_id); 
CREATE INDEX idx_organizations_parent ON organizations(parent_id); 
CREATE INDEX idx_contact_read ON contact_info(is_read);