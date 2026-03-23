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
    member_type VARCHAR(20) DEFAULT 'student',
    student_code VARCHAR(30),
    class_name VARCHAR(50),
    department VARCHAR(50),
    department_position VARCHAR(30),
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (
    username,password,email,full_name,role,
    member_type,student_code,class_name,department,department_position,is_active
) VALUES
('admin','123456','admin@myapp.com','Nguyễn Văn Admin','admin','teacher',NULL,NULL,NULL,NULL,TRUE),
('gvfit1','123456','nguyen.vana@fit.hcmus.edu.vn','TS. Nguyễn Văn A','teacher','teacher',NULL,NULL,NULL,NULL,TRUE),
('gvfit2','123456','tran.thib@fit.hcmus.edu.vn','ThS. Trần Thị B','teacher','teacher',NULL,NULL,NULL,NULL,TRUE),
('sv22001','123456','sv22001@student.hcmus.edu.vn','Lê Minh Nhật','student','student','22120001','22CTT1','ttkt','trưởng ban',TRUE),
('sv22002','123456','sv22002@student.hcmus.edu.vn','Phạm Gia Hân','student','student','22120002','22CTT1','ttkt','phó ban',TRUE),
('sv22003','123456','sv22003@student.hcmus.edu.vn','Đỗ Tuấn Kiệt','student','student','22120003','22CTT2','ctd & ptd','thành viên',TRUE),
('sv22004','123456','sv22004@student.hcmus.edu.vn','Nguyễn Bảo Trân','student','student','22120004','22CTT2','ctd & ptd','phó ban',TRUE),
('sv22005','123456','sv22005@student.hcmus.edu.vn','Trần Khánh Duy','student','student','22120005','22CTT3','tcsk','trưởng ban',TRUE),
('sv22006','123456','sv22006@student.hcmus.edu.vn','Võ Hải Yến','student','student','22120006','22CTT3','tcsk','thành viên',TRUE),
('sv22007','123456','sv22007@student.hcmus.edu.vn','Bùi Quang Huy','student','student','22120007','22CTT4','văn thể','trưởng ban',TRUE),
('sv22008','123456','sv22008@student.hcmus.edu.vn','Phan Ngọc Lan','student','student','22120008','22CTT4','văn thể','thành viên',TRUE),
('sv22009','123456','sv22009@student.hcmus.edu.vn','Lý Hoàng Anh','student','student','22120009','22CTT5','đối ngoại','trưởng ban',TRUE),
('sv22010','123456','sv22010@student.hcmus.edu.vn','Đặng Mỹ Linh','student','student','22120010','22CTT5','đối ngoại','phó ban',TRUE),
('sv22011','123456','sv22011@student.hcmus.edu.vn','Ngô Quốc Bình','student','student','22120011','22CTT6','ttkt','thành viên',TRUE),
('sv22012','123456','sv22012@student.hcmus.edu.vn','Huỳnh Minh Khang','student','student','22120012','22CTT6','ctd & ptd','thành viên',FALSE);

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
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id)
);

INSERT INTO categories (name,slug,page_type,description,intro_image,parent_id) VALUES
('Tin tức','tin-tuc','news','Tin tức của Liên Chi đoàn',NULL,NULL),
('Thông báo','thong-bao','news','Thông báo chính thức',NULL,NULL),
('Sự kiện','su-kien','news','Các sự kiện',NULL,NULL),
('Hoạt động học thuật','hoc-thuat','activity','Hoạt động học thuật',NULL,NULL),
('Hoạt động tình nguyện','tinh-nguyen','activity','Hoạt động cộng đồng',NULL,NULL),
('Hoạt động thể thao','the-thao','activity','Hoạt động thể thao',NULL,NULL),
('Thành tích','thanh-tich','achievement','Thành tích nổi bật',NULL,NULL),
('Tài liệu','tai-lieu','document','Tài liệu',NULL,NULL),
('Chương trình thường niên','thuong-nien','activity_annual','Hoạt động thường niên','https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',NULL),
('Khác','khac','news','Danh mục khác',NULL,NULL),
('Chào tân sinh viên','chao-tan-sinh-vien','activity_annual','Lễ chào tân sinh viên khóa mới',NULL,9),
('Quân sự','quan-su','activity_annual','Quân sự huấn luyện sinh viên',NULL,9),
('FIT Cup','fit-cup','activity_annual','Giải bóng đá FIT Cup',NULL,9),
('Prom','prom','activity_annual','Lễ prom sinh viên',NULL,9),
('Talkshow','talkshow','activity_annual','Talkshow và giao lưu',NULL,9),
('Cuộc thi','cuoc-thi','activity_annual','Các cuộc thi và hackathon',NULL,9);

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
('Lễ chào tân sinh viên 2025','chao-tan-2025','Chương trình chào tân sinh viên khóa 25 được tổ chức nhằm giúp các bạn sinh viên mới làm quen với môi trường đại học.','Hội trường chính','2025-09-01','2025-09-02',11,1),
('Quân sự huấn luyện khóa 25','quan-su-2025','Chương trình quân sự huấn luyện sinh viên khóa mới, giúp các bạn nâng cao tinh thần kỷ luật và thể lực.','Sân trường','2025-09-05','2025-09-10',12,1),
('FIT Cup 2025','fit-cup-2025','Giải bóng đá FIT Cup thường niên, đây là sân chơi lớn nhất của sinh viên khoa CNTT mỗi năm.','Sân bóng đá UTE','2025-10-01','2025-10-20',13,1),
('Prom sinh viên 2025','prom-2025','Lễ prom sinh viên khoa CNTT - sự kiện lớn nhất của năm học với sự tham gia của hàng trăm bạn sinh viên.','Sân khấu trước hội trường','2025-12-15','2025-12-15',14,2),
('Talkshow công nghệ','talkshow-tech','Talkshow về xu hướng công nghệ mới, các chuyên gia chia sẻ kinh nghiệm và cơ hội nghề nghiệp.','Phòng hội thảo','2025-05-20','2025-05-20',15,2),
('Hackathon 2025','hackathon-2025','Cuộc thi Hackathon thường niên dành cho sinh viên lập trình và công nghệ thông tin.','Lab CNTT','2025-08-01','2025-08-02',16,1),
('Giải lập trình sinh viên','giai-lap-trinh','Giải lập trình thường niên với các bài toán thách thức về thuật toán và cấu trúc dữ liệu.','Lab CNTT','2025-12-01','2025-12-05',16,3),
('Workshop lập trình web','workshop-web','Workshop tập trung vào các công nghệ web hiện đại như React, Node.js, và các framework khác.','Phòng lab','2025-06-15','2025-06-15',15,2),
('FIT Cup futsal','fit-cup-futsal','Giải bóng đá futsal trong khuôn khổ FIT Cup với sự tham gia của nhiều đội bóng từ các lớp.','Sân futsal','2025-11-01','2025-11-15',13,1),
('Workshop AI & Data Science','workshop-ai-data','Workshop về ứng dụng AI và Data Science trong doanh nghiệp và nghiên cứu khoa học.','Phòng hội thảo','2025-07-10','2025-07-10',15,2);

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